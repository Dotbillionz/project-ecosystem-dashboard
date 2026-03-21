import ccxt from "ccxt";
import { logger } from "./logger";

export type TradeSymbol = "BTC/USDT" | "ETH/USDT" | "SOL/USDT";

export interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface TradeResult {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  cost: number;
  timestamp: number;
  status: "filled" | "open" | "cancelled";
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

export interface TradeStrategy {
  symbol: TradeSymbol;
  amountUSDT: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  dryRun: boolean;
}

const COINGECKO_IDS: Record<TradeSymbol, string> = {
  "BTC/USDT": "bitcoin",
  "ETH/USDT": "ethereum",
  "SOL/USDT": "solana",
};

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price" +
  "?ids=bitcoin,ethereum,solana" +
  "&vs_currencies=usd" +
  "&include_24hr_change=true" +
  "&include_24hr_vol=true" +
  "&include_high_24h=true" +
  "&include_low_24h=true";

interface CoinGeckoResponse {
  [coin: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_high_24h?: number;
    usd_low_24h?: number;
  };
}

let priceCache: { data: CoinGeckoResponse; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

async function fetchCoinGeckoPrices(): Promise<CoinGeckoResponse> {
  const now = Date.now();
  if (priceCache && now - priceCache.fetchedAt < CACHE_TTL_MS) {
    return priceCache.data;
  }

  const res = await fetch(COINGECKO_URL);
  if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
  const data = (await res.json()) as CoinGeckoResponse;
  priceCache = { data, fetchedAt: now };
  return data;
}

export async function fetchTicker(symbol: TradeSymbol): Promise<TickerData> {
  try {
    const coinId = COINGECKO_IDS[symbol];
    const prices = await fetchCoinGeckoPrices();
    const coin = prices[coinId];

    if (!coin) throw new Error(`No data for ${coinId}`);

    return {
      symbol,
      price: coin.usd,
      change24h: coin.usd_24h_change,
      high24h: coin.usd_high_24h ?? coin.usd * 1.01,
      low24h: coin.usd_low_24h ?? coin.usd * 0.99,
      volume24h: coin.usd_24h_vol,
      timestamp: Date.now(),
    };
  } catch (err) {
    logger.error({ err, symbol }, "Failed to fetch ticker from CoinGecko");
    throw err;
  }
}

export async function fetchMultipleTickers(
  symbols: TradeSymbol[],
): Promise<TickerData[]> {
  try {
    const prices = await fetchCoinGeckoPrices();
    return symbols.map((symbol) => {
      const coinId = COINGECKO_IDS[symbol];
      const coin = prices[coinId];
      return {
        symbol,
        price: coin?.usd ?? 0,
        change24h: coin?.usd_24h_change ?? 0,
        high24h: coin?.usd_high_24h ?? (coin?.usd ?? 0) * 1.01,
        low24h: coin?.usd_low_24h ?? (coin?.usd ?? 0) * 0.99,
        volume24h: coin?.usd_24h_vol ?? 0,
        timestamp: Date.now(),
      };
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch tickers from CoinGecko");
    return [];
  }
}

function getExchange() {
  const apiKey = process.env["BINANCE_API_KEY"];
  const secret = process.env["BINANCE_SECRET"];

  if (!apiKey || !secret) {
    throw new Error(
      "BINANCE_API_KEY and BINANCE_SECRET must be set in environment variables",
    );
  }

  return new ccxt.binance({
    apiKey,
    secret,
    enableRateLimit: true,
    options: { defaultType: "spot" },
  });
}

export async function executeTrade(strategy: TradeStrategy): Promise<TradeResult> {
  const { symbol, amountUSDT, stopLossPercent, takeProfitPercent, dryRun } = strategy;

  const ticker = await fetchTicker(symbol);
  const price = ticker.price;

  if (price <= 0) throw new Error(`Invalid price for ${symbol}: ${price}`);

  const amount = amountUSDT / price;
  const stopLossPrice = price * (1 - stopLossPercent / 100);
  const takeProfitPrice = price * (1 + takeProfitPercent / 100);

  logger.info({ symbol, price, amount, stopLossPrice, takeProfitPrice, dryRun }, "Preparing trade");

  if (dryRun) {
    const simResult: TradeResult = {
      id: `sim_${Date.now()}`,
      symbol,
      side: "buy",
      amount,
      price,
      cost: amountUSDT,
      timestamp: Date.now(),
      status: "filled",
      stopLossPrice,
      takeProfitPrice,
    };
    logger.info({ simResult }, "Dry-run trade simulated");
    return simResult;
  }

  const exchange = getExchange();
  const order = await exchange.createMarketBuyOrder(symbol, amount);

  return {
    id: String(order.id),
    symbol,
    side: "buy",
    amount: order.amount ?? amount,
    price: order.average ?? price,
    cost: order.cost ?? amountUSDT,
    timestamp: order.timestamp ?? Date.now(),
    status: order.status === "closed" ? "filled" : "open",
    stopLossPrice,
    takeProfitPrice,
  };
}

export async function fetchBalance(): Promise<Record<string, number>> {
  const exchange = getExchange();
  const balance = await exchange.fetchBalance();

  const nonZero: Record<string, number> = {};
  for (const [currency, amount] of Object.entries(balance.total ?? {})) {
    if (typeof amount === "number" && amount > 0) {
      nonZero[currency] = amount;
    }
  }
  return nonZero;
}
