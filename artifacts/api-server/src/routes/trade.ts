import { Router, type IRouter } from "express";
import {
  fetchTicker,
  fetchMultipleTickers,
  executeTrade,
  fetchBalance,
  type TradeSymbol,
  type TradeStrategy,
} from "../lib/tradebot";
import {
  analyzeTrend,
  calcPositionSize,
  recordTrade,
  closeTrade,
  getTradeHistory,
  calcStats,
  type TradeRecord,
} from "../lib/risk-engine";

const router: IRouter = Router();

router.get("/trade/tickers", async (req, res) => {
  try {
    const symbols: TradeSymbol[] = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
    const tickers = await fetchMultipleTickers(symbols);
    res.json({ success: true, tickers });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch tickers");
    res.status(500).json({ success: false, error: "Failed to fetch market data" });
  }
});

router.get("/trade/ticker/:symbol", async (req, res) => {
  try {
    const raw = req.params["symbol"]?.replace("_", "/") as TradeSymbol;
    const allowed: TradeSymbol[] = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
    if (!allowed.includes(raw)) {
      res.status(400).json({ success: false, error: "Unsupported symbol" });
      return;
    }
    const ticker = await fetchTicker(raw);
    res.json({ success: true, ticker });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch ticker");
    res.status(500).json({ success: false, error: "Failed to fetch ticker" });
  }
});

router.get("/trade/analyze/:symbol", async (req, res) => {
  try {
    const raw = req.params["symbol"]?.replace("_", "/") as TradeSymbol;
    const allowed: TradeSymbol[] = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
    if (!allowed.includes(raw)) {
      res.status(400).json({ success: false, error: "Unsupported symbol" });
      return;
    }

    const ticker = await fetchTicker(raw);
    const analysis = await analyzeTrend(raw, ticker.price);

    const accountBalance = Number(req.query["balance"] ?? 1000);
    const riskPercent = Number(req.query["risk"] ?? 2);
    const stopLossPercent = Number(req.query["sl"] ?? 1);
    const takeProfitPercent = Number(req.query["tp"] ?? 2);

    const sizing = calcPositionSize({
      symbol: raw,
      entryPrice: ticker.price,
      accountBalance,
      riskPercent,
      stopLossPercent,
      takeProfitPercent,
    });

    res.json({ success: true, analysis, sizing });
  } catch (err) {
    req.log.error({ err }, "Failed to analyze symbol");
    const msg = err instanceof Error ? err.message : "Analysis failed";
    res.status(500).json({ success: false, error: msg });
  }
});

router.post("/trade/execute", async (req, res) => {
  try {
    const {
      symbol = "BTC/USDT",
      amountUSDT = 10,
      stopLossPercent = 2,
      takeProfitPercent = 4,
      dryRun = true,
    } = req.body as Partial<TradeStrategy & { useRiskEngine?: boolean; accountBalance?: number; riskPercent?: number }>;

    const allowed: TradeSymbol[] = ["BTC/USDT", "ETH/USDT", "SOL/USDT"];
    if (!allowed.includes(symbol as TradeSymbol)) {
      res.status(400).json({ success: false, error: "Unsupported symbol" });
      return;
    }

    if (amountUSDT <= 0 || amountUSDT > 10000) {
      res.status(400).json({ success: false, error: "Amount must be between 1 and 10000 USDT" });
      return;
    }

    const ticker = await fetchTicker(symbol as TradeSymbol);
    const analysis = await analyzeTrend(symbol, ticker.price);

    const result = await executeTrade({
      symbol: symbol as TradeSymbol,
      amountUSDT,
      stopLossPercent,
      takeProfitPercent,
      dryRun,
    });

    const record: TradeRecord = {
      id: result.id,
      symbol: result.symbol,
      side: result.side,
      entryPrice: result.price,
      amount: result.amount,
      costUSDT: result.cost,
      stopLossPrice: result.stopLossPrice ?? result.price * (1 - stopLossPercent / 100),
      takeProfitPrice: result.takeProfitPrice ?? result.price * (1 + takeProfitPercent / 100),
      outcome: "open",
      timestamp: result.timestamp,
      dryRun,
      trendSignal: analysis.signal,
      rsiAtEntry: analysis.rsi14,
      ema20AtEntry: analysis.ema20,
    };

    recordTrade(record);

    req.log.info({ result, dryRun, trend: analysis.trend, signal: analysis.signal }, "Trade executed");
    res.json({ success: true, trade: result, dryRun, analysis });
  } catch (err) {
    req.log.error({ err }, "Trade execution failed");
    const message = err instanceof Error ? err.message : "Trade execution failed";
    res.status(500).json({ success: false, error: message });
  }
});

router.post("/trade/close/:id", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { exitPrice } = req.body as { exitPrice?: number };

    if (!exitPrice || exitPrice <= 0) {
      res.status(400).json({ success: false, error: "exitPrice is required" });
      return;
    }

    const closed = closeTrade(id, exitPrice);
    if (!closed) {
      res.status(404).json({ success: false, error: "Trade not found" });
      return;
    }

    res.json({ success: true, trade: closed });
  } catch (err) {
    req.log.error({ err }, "Failed to close trade");
    res.status(500).json({ success: false, error: "Failed to close trade" });
  }
});

router.get("/trade/history", (_req, res) => {
  const history = getTradeHistory();
  const stats = calcStats();
  res.json({ success: true, history, stats });
});

router.get("/trade/stats", (_req, res) => {
  const stats = calcStats();
  const history = getTradeHistory().slice(0, 5);
  res.json({ success: true, stats, recentTrades: history });
});

router.get("/trade/balance", async (req, res) => {
  try {
    const hasKeys =
      !!process.env["BINANCE_API_KEY"] && !!process.env["BINANCE_SECRET"];

    if (!hasKeys) {
      res.json({
        success: true,
        balance: { USDT: 0, BTC: 0, ETH: 0 },
        connected: false,
        message: "Add BINANCE_API_KEY and BINANCE_SECRET to enable live balance",
      });
      return;
    }

    const balance = await fetchBalance();
    res.json({ success: true, balance, connected: true });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch balance");
    res.status(500).json({ success: false, error: "Failed to fetch balance" });
  }
});

router.get("/trade/status", (_req, res) => {
  const hasKeys =
    !!process.env["BINANCE_API_KEY"] && !!process.env["BINANCE_SECRET"];

  res.json({
    connected: hasKeys,
    exchange: "Binance",
    mode: hasKeys ? "live" : "demo",
    sumupConfigured: !!process.env["SUMUP_PAYMENT_LINK"],
    sumupLink: process.env["SUMUP_PAYMENT_LINK"] ?? null,
  });
});

export default router;
