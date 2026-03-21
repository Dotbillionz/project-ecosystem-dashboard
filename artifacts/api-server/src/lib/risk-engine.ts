/**
 * SpotX Risk Engine
 * Handles position sizing, trend analysis, and P&L tracking.
 */

export interface TrendAnalysis {
  symbol: string;
  currentPrice: number;
  ema20: number;
  ema50: number;
  rsi14: number;
  trend: "bullish" | "bearish" | "neutral";
  trendStrength: number;
  signal: "buy" | "hold" | "sell";
  signalReason: string;
  prices: number[];
  timestamp: number;
}

export interface PositionSize {
  symbol: string;
  entryPrice: number;
  accountBalance: number;
  riskPercent: number;
  riskAmount: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  positionSizeBase: number;
  positionSizeUSDT: number;
  riskRewardRatio: number;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  grossPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  currentStreak: number;
}

export interface TradeRecord {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  costUSDT: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  pnl?: number;
  pnlPercent?: number;
  outcome?: "win" | "loss" | "open";
  timestamp: number;
  closedAt?: number;
  dryRun: boolean;
  trendSignal: string;
  rsiAtEntry: number;
  ema20AtEntry: number;
}

const COINGECKO_CHART_URL = "https://api.coingecko.com/api/v3/coins";

const COINGECKO_IDS: Record<string, string> = {
  "BTC/USDT": "bitcoin",
  "ETH/USDT": "ethereum",
  "SOL/USDT": "solana",
};

interface OHLCVEntry {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface HistoricalCache {
  data: OHLCVEntry[];
  fetchedAt: number;
}

const historicalCache = new Map<string, HistoricalCache>();
const OHLCV_CACHE_TTL = 60_000;

async function fetchHistoricalPrices(symbol: string, hours = 72): Promise<number[]> {
  const coinId = COINGECKO_IDS[symbol];
  if (!coinId) throw new Error(`Unknown symbol: ${symbol}`);

  const cached = historicalCache.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < OHLCV_CACHE_TTL) {
    return cached.data.map((d) => d.close);
  }

  const days = Math.ceil(hours / 24);
  const url = `${COINGECKO_CHART_URL}/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko market_chart returned ${res.status}`);

  const json = (await res.json()) as { prices: [number, number][] };
  const data: OHLCVEntry[] = json.prices.map(([ts, price]) => ({
    timestamp: ts,
    open: price,
    high: price,
    low: price,
    close: price,
  }));

  historicalCache.set(symbol, { data, fetchedAt: Date.now() });
  return data.map((d) => d.close);
}

function calcEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] ?? 0;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i]! * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;

  const changes = prices.slice(1).map((p, i) => p - prices[i]!);
  const relevant = changes.slice(-period);

  const gains = relevant.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(relevant.filter((c) => c < 0).reduce((a, b) => a + b, 0)) / period;

  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

export async function analyzeTrend(symbol: string, currentPrice: number): Promise<TrendAnalysis> {
  const prices = await fetchHistoricalPrices(symbol, 72);
  const allPrices = [...prices, currentPrice];

  const ema20 = calcEMA(allPrices, 20);
  const ema50 = calcEMA(allPrices, 50);
  const rsi14 = calcRSI(allPrices, 14);

  let trend: TrendAnalysis["trend"];
  let signal: TrendAnalysis["signal"];
  let signalReason: string;
  let trendStrength: number;

  const pricePct = ((currentPrice - ema20) / ema20) * 100;
  const emaDivergence = ((ema20 - ema50) / ema50) * 100;

  if (currentPrice > ema20 && ema20 > ema50) {
    trend = "bullish";
    trendStrength = Math.min(100, Math.abs(emaDivergence) * 10);
  } else if (currentPrice < ema20 && ema20 < ema50) {
    trend = "bearish";
    trendStrength = Math.min(100, Math.abs(emaDivergence) * 10);
  } else {
    trend = "neutral";
    trendStrength = 20;
  }

  const rsiOverbought = rsi14 > 70;
  const rsiOversold = rsi14 < 30;
  const rsiNeutral = rsi14 >= 30 && rsi14 <= 70;

  if (trend === "bullish" && rsiNeutral) {
    signal = "buy";
    signalReason = `Uptrend confirmed (EMA20 > EMA50). RSI ${rsi14.toFixed(1)} — neutral zone, safe entry.`;
  } else if (trend === "bullish" && rsiOverbought) {
    signal = "hold";
    signalReason = `Uptrend active but RSI ${rsi14.toFixed(1)} is overbought (>70). Waiting for pullback.`;
  } else if (trend === "bearish" && rsiOversold) {
    signal = "hold";
    signalReason = `Downtrend active but RSI ${rsi14.toFixed(1)} oversold (<30). Potential reversal — hold.`;
  } else if (trend === "bearish") {
    signal = "sell";
    signalReason = `Downtrend: price below EMA20 & EMA50. RSI ${rsi14.toFixed(1)}. Avoid buying.`;
  } else {
    signal = "hold";
    signalReason = `Neutral market. Price ${pricePct > 0 ? "+" : ""}${pricePct.toFixed(2)}% vs EMA20. Wait for clearer trend.`;
  }

  return {
    symbol,
    currentPrice,
    ema20,
    ema50,
    rsi14,
    trend,
    trendStrength,
    signal,
    signalReason,
    prices: allPrices.slice(-50),
    timestamp: Date.now(),
  };
}

export function calcPositionSize(params: {
  symbol: string;
  entryPrice: number;
  accountBalance: number;
  riskPercent: number;
  stopLossPercent: number;
  takeProfitPercent: number;
}): PositionSize {
  const { symbol, entryPrice, accountBalance, riskPercent, stopLossPercent, takeProfitPercent } = params;

  const riskAmount = accountBalance * (riskPercent / 100);
  const stopLossPrice = entryPrice * (1 - stopLossPercent / 100);
  const takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
  const stopLossDistance = entryPrice - stopLossPrice;

  const positionSizeBase = riskAmount / stopLossDistance;
  const positionSizeUSDT = positionSizeBase * entryPrice;
  const riskRewardRatio = takeProfitPercent / stopLossPercent;

  return {
    symbol,
    entryPrice,
    accountBalance,
    riskPercent,
    riskAmount,
    stopLossPrice,
    takeProfitPrice,
    stopLossPercent,
    takeProfitPercent,
    positionSizeBase,
    positionSizeUSDT,
    riskRewardRatio,
  };
}

const tradeHistory: TradeRecord[] = [];

export function recordTrade(trade: Omit<TradeRecord, never>): void {
  const existing = tradeHistory.findIndex((t) => t.id === trade.id);
  if (existing >= 0) {
    tradeHistory[existing] = trade;
  } else {
    tradeHistory.unshift(trade);
    if (tradeHistory.length > 200) tradeHistory.pop();
  }
}

export function closeTrade(id: string, exitPrice: number): TradeRecord | null {
  const trade = tradeHistory.find((t) => t.id === id);
  if (!trade) return null;

  const pnl = (exitPrice - trade.entryPrice) * trade.amount;
  const pnlPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
  const outcome: TradeRecord["outcome"] = pnl >= 0 ? "win" : "loss";

  const updated: TradeRecord = {
    ...trade,
    exitPrice,
    pnl,
    pnlPercent,
    outcome,
    closedAt: Date.now(),
  };

  recordTrade(updated);
  return updated;
}

export function getTradeHistory(): TradeRecord[] {
  return [...tradeHistory];
}

export function calcStats(): TradeStats {
  const closed = tradeHistory.filter((t) => t.outcome && t.outcome !== "open");

  if (closed.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      grossPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      largestWin: 0,
      largestLoss: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      currentStreak: 0,
    };
  }

  const wins = closed.filter((t) => t.outcome === "win");
  const losses = closed.filter((t) => t.outcome === "loss");

  const grossPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const totalWinAmt = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const totalLossAmt = Math.abs(losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0));

  const avgWin = wins.length > 0 ? totalWinAmt / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmt / losses.length : 0;
  const profitFactor = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : totalWinAmt > 0 ? Infinity : 0;
  const winRate = wins.length / closed.length;
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl ?? 0)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl ?? 0)) : 0;

  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let currentStreak = 0;

  const outcomes = closed.map((t) => t.outcome);
  let runWins = 0;
  let runLosses = 0;

  for (const o of outcomes) {
    if (o === "win") {
      runWins++;
      runLosses = 0;
    } else {
      runLosses++;
      runWins = 0;
    }
    consecutiveWins = Math.max(consecutiveWins, runWins);
    consecutiveLosses = Math.max(consecutiveLosses, runLosses);
  }

  const last = outcomes[0];
  if (last === "win") currentStreak = runWins;
  else if (last === "loss") currentStreak = -runLosses;

  return {
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate,
    grossPnl,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    largestWin,
    largestLoss,
    consecutiveWins,
    consecutiveLosses,
    currentStreak,
  };
}
