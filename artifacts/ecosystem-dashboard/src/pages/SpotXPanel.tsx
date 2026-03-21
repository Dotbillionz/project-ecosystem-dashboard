import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

interface Ticker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

interface Analysis {
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
}

interface Sizing {
  entryPrice: number;
  accountBalance: number;
  riskPercent: number;
  riskAmount: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  positionSizeBase: number;
  positionSizeUSDT: number;
  riskRewardRatio: number;
}

interface TradeResult {
  id: string;
  symbol: string;
  side: string;
  amount: number;
  price: number;
  cost: number;
  timestamp: number;
  status: string;
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

interface Stats {
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
  currentStreak: number;
}

interface TradeRecord {
  id: string;
  symbol: string;
  side: string;
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
  dryRun: boolean;
  trendSignal: string;
  rsiAtEntry: number;
}

interface TradeStatus {
  connected: boolean;
  exchange: string;
  mode: string;
  sumupConfigured: boolean;
  sumupLink: string | null;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT"] as const;
type Symbol = (typeof SYMBOLS)[number];

const COIN_COLORS: Record<Symbol, string> = {
  "BTC/USDT": "#f59e0b",
  "ETH/USDT": "#8b5cf6",
  "SOL/USDT": "#06b6d4",
};
const COIN_ICONS: Record<Symbol, string> = {
  "BTC/USDT": "₿",
  "ETH/USDT": "Ξ",
  "SOL/USDT": "◎",
};

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function MiniChart({ prices, color }: { prices: number[]; color: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  if (!prices || prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 200;
  const h = 48;

  const points = prices
    .map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(" ");

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#g-${color.replace("#", "")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RSIBar({ rsi }: { rsi: number }) {
  const color = rsi > 70 ? "#ef4444" : rsi < 30 ? "#22c55e" : "#f59e0b";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/40">RSI 14</span>
        <span style={{ color }} className="font-mono font-bold">{rsi.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rsi}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/25">
        <span>Oversold</span><span>Overbought</span>
      </div>
    </div>
  );
}

type ActiveTab = "trade" | "strategy" | "history" | "wallet";

export function SpotXPanel() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("trade");
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol>("BTC/USDT");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [sizing, setSizing] = useState<Sizing | null>(null);
  const [tradeStatus, setTradeStatus] = useState<TradeStatus | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<TradeRecord[]>([]);
  const [trades, setTrades] = useState<TradeResult[]>([]);

  const [amountUSDT, setAmountUSDT] = useState(10);
  const [stopLoss, setStopLoss] = useState(1.5);
  const [takeProfit, setTakeProfit] = useState(3);
  const [dryRun, setDryRun] = useState(true);
  const [accountBalance, setAccountBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(2);

  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  const fetchBase = useCallback(async () => {
    const [tickRes, statusRes, statsRes] = await Promise.all([
      fetch(`${API}/trade/tickers`),
      fetch(`${API}/trade/status`),
      fetch(`${API}/trade/stats`),
    ]);
    if (tickRes.ok) { const d = await tickRes.json(); if (d.success) setTickers(d.tickers); }
    if (statusRes.ok) { const d = await statusRes.json(); setTradeStatus(d); }
    if (statsRes.ok) { const d = await statsRes.json(); if (d.success) { setStats(d.stats); setHistory(d.recentTrades ?? []); } }
    setLoading(false);
  }, []);

  const fetchAnalysis = useCallback(async (sym: Symbol) => {
    setAnalysisLoading(true);
    try {
      const symParam = sym.replace("/", "_");
      const res = await fetch(`${API}/trade/analyze/${symParam}?balance=${accountBalance}&risk=${riskPercent}&sl=${stopLoss}&tp=${takeProfit}`);
      if (res.ok) {
        const d = await res.json();
        if (d.success) { setAnalysis(d.analysis); setSizing(d.sizing); }
      }
    } finally {
      setAnalysisLoading(false);
    }
  }, [accountBalance, riskPercent, stopLoss, takeProfit]);

  useEffect(() => {
    fetchBase();
    const interval = setInterval(fetchBase, 20000);
    return () => clearInterval(interval);
  }, [fetchBase]);

  useEffect(() => {
    fetchAnalysis(selectedSymbol);
  }, [selectedSymbol, fetchAnalysis]);

  const executeTrade = async () => {
    setTradeLoading(true);
    setTradeError(null);
    setTradeSuccess(null);
    try {
      const res = await fetch(`${API}/trade/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: selectedSymbol, amountUSDT, stopLossPercent: stopLoss, takeProfitPercent: takeProfit, dryRun }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Trade failed");
      setTrades((p) => [data.trade, ...p].slice(0, 10));
      setTradeSuccess(dryRun
        ? `Simulation: Buy ${data.trade.amount.toFixed(6)} ${selectedSymbol.split("/")[0]} @ $${fmt(data.trade.price)} · SL $${fmt(data.trade.stopLossPrice ?? 0)} · TP $${fmt(data.trade.takeProfitPrice ?? 0)}`
        : `LIVE: Bought ${data.trade.amount.toFixed(6)} ${selectedSymbol.split("/")[0]} @ $${fmt(data.trade.price)}`
      );
      fetchBase();
    } catch (err) {
      setTradeError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setTradeLoading(false);
    }
  };

  const ticker = tickers.find((t) => t.symbol === selectedSymbol);
  const color = COIN_COLORS[selectedSymbol];

  const signalColors = { buy: "text-green-400", hold: "text-amber-400", sell: "text-red-400" };
  const trendColors = { bullish: "text-green-400", bearish: "text-red-400", neutral: "text-amber-400" };
  const signalBgs = { buy: "bg-green-500/10 border-green-500/30", hold: "bg-amber-500/10 border-amber-500/30", sell: "bg-red-500/10 border-red-500/30" };

  const TABS: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "trade", label: "Trade", icon: "🚀" },
    { id: "strategy", label: "Strategy", icon: "🧠" },
    { id: "history", label: "P&L History", icon: "📊" },
    { id: "wallet", label: "Wallet", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-[#050a10] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#050a10] to-[#0a0510]" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] rounded-full blur-3xl" style={{ background: `${color}08` }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="text-white/40 hover:text-white transition-colors text-sm">← Back</button>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-xl">💎</span>
                <div>
                  <h1 className="font-black text-amber-400 text-base leading-none tracking-tight">SpotX TradeBot</h1>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">Risk-Controlled Engine</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tradeStatus && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tradeStatus.connected ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tradeStatus.connected ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
                  {tradeStatus.connected ? "Live · Binance" : "Demo Mode"}
                </div>
              )}
              <button
                onClick={() => setDryRun(!dryRun)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${dryRun ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"}`}
              >
                {dryRun ? "SIM" : "LIVE"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "border-amber-400 text-amber-400" : "border-transparent text-white/40 hover:text-white/70"}`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Hero banner — SpotX visual from your design */}
        <div className="relative w-full overflow-hidden" style={{ height: "200px" }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/spotx-hero.png)",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050a10]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050a10]/80 via-transparent to-[#050a10]/80" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 flex items-end justify-between">
            <div>
              <p className="text-amber-400 font-black text-2xl tracking-tight drop-shadow-lg">SpotX Ecosystem</p>
              <p className="text-white/50 text-xs uppercase tracking-widest">Core Financial Engine — Wallet · TradeBot · Smart Dashboard · On/Off-Ramps</p>
            </div>
            <div className="flex gap-2">
              {["Stripe", "Coinbase", "NowPayments"].map((p) => (
                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 text-white/40 backdrop-blur-sm bg-black/30">{p}</span>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Ticker Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {loading ? SYMBOLS.map((s) => (
              <div key={s} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            )) : SYMBOLS.map((sym) => {
              const t = tickers.find((x) => x.symbol === sym);
              const c = COIN_COLORS[sym];
              const isPos = (t?.change24h ?? 0) >= 0;
              const isSelected = selectedSymbol === sym;
              return (
                <motion.button key={sym} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`relative overflow-hidden rounded-2xl p-4 text-left border transition-all ${isSelected ? "border-amber-500/40" : "border-white/10 hover:border-white/20"}`}
                  style={{ background: isSelected ? `${c}10` : undefined }}
                >
                  {isSelected && <div className="absolute inset-0 opacity-5 rounded-2xl" style={{ background: `radial-gradient(circle, ${c}, transparent)` }} />}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm" style={{ color: c }}>{COIN_ICONS[sym]} {sym.split("/")[0]}</span>
                    <span className={`text-xs font-semibold ${isPos ? "text-green-400" : "text-red-400"}`}>{t ? fmtPct(t.change24h) : "--"}</span>
                  </div>
                  <p className="text-lg font-black">{t ? `$${fmt(t.price)}` : "..."}</p>
                  {analysis && isSelected && <MiniChart prices={analysis.prices} color={c} />}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* ===== TRADE TAB ===== */}
            {activeTab === "trade" && (
              <motion.div key="trade" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Trade form */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Execute Trade</h2>
                    {analysis && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${signalBgs[analysis.signal]}`}>
                        <span className={signalColors[analysis.signal]}>{analysis.signal.toUpperCase()}</span>
                        <span className={trendColors[analysis.trend]}>{analysis.trend}</span>
                      </div>
                    )}
                  </div>

                  {analysis && (
                    <div className={`p-3 rounded-xl border text-sm ${signalBgs[analysis.signal]}`}>
                      <span className={`font-semibold ${signalColors[analysis.signal]}`}>
                        {analysis.signal === "buy" ? "🟢" : analysis.signal === "sell" ? "🔴" : "🟡"} Signal:&nbsp;
                      </span>
                      <span className="text-white/70">{analysis.signalReason}</span>
                    </div>
                  )}

                  {/* Symbol selector */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Asset</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SYMBOLS.map((s) => (
                        <button key={s} onClick={() => setSelectedSymbol(s)}
                          className={`py-2 rounded-xl text-sm font-bold border transition-all ${selectedSymbol === s ? "border-amber-500/50 text-amber-400" : "border-white/10 text-white/50 hover:border-white/20"}`}
                          style={{ background: selectedSymbol === s ? `${COIN_COLORS[s]}18` : undefined }}>
                          {COIN_ICONS[s]} {s.split("/")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Amount (USDT)</label>
                    <div className="flex gap-2">
                      <input type="number" min={1} max={10000} value={amountUSDT}
                        onChange={(e) => setAmountUSDT(Number(e.target.value))}
                        className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50 text-sm" />
                      {[10, 50, 100, 500].map((v) => (
                        <button key={v} onClick={() => setAmountUSDT(v)}
                          className={`px-3 py-2 rounded-xl text-xs border transition-all ${amountUSDT === v ? "border-amber-500/50 text-amber-400" : "border-white/10 text-white/40 hover:border-white/20"}`}
                          style={{ background: amountUSDT === v ? "#f59e0b18" : undefined }}>
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Risk sliders */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                        <span>Stop Loss</span><span className="text-red-400 font-mono">{stopLoss}%</span>
                      </label>
                      <input type="range" min={0.5} max={10} step={0.5} value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))} className="w-full accent-red-500" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                        <span>Take Profit</span><span className="text-green-400 font-mono">{takeProfit}%</span>
                      </label>
                      <input type="range" min={0.5} max={20} step={0.5} value={takeProfit}
                        onChange={(e) => setTakeProfit(Number(e.target.value))} className="w-full accent-green-500" />
                    </div>
                  </div>

                  {/* Price levels */}
                  {ticker && (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-black/30 rounded-xl border border-white/10 text-center text-sm">
                      <div>
                        <p className="text-white/30 text-xs mb-0.5">Entry</p>
                        <p className="font-mono font-bold">${fmt(ticker.price)}</p>
                      </div>
                      <div>
                        <p className="text-red-400/60 text-xs mb-0.5">Stop Loss</p>
                        <p className="font-mono font-bold text-red-400">${fmt(ticker.price * (1 - stopLoss / 100))}</p>
                      </div>
                      <div>
                        <p className="text-green-400/60 text-xs mb-0.5">Take Profit</p>
                        <p className="font-mono font-bold text-green-400">${fmt(ticker.price * (1 + takeProfit / 100))}</p>
                      </div>
                    </div>
                  )}

                  {/* Risk/reward + max PnL */}
                  <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-xs">
                    <span className="text-white/50">Risk/Reward:&nbsp;
                      <span className={`font-bold ${takeProfit / stopLoss >= 2 ? "text-green-400" : "text-amber-400"}`}>
                        1 : {(takeProfit / stopLoss).toFixed(1)}
                      </span>
                    </span>
                    <span className="text-white/30">
                      Max loss <span className="text-red-400 font-mono">-${fmt(amountUSDT * stopLoss / 100)}</span>
                      &nbsp;·&nbsp;Max gain <span className="text-green-400 font-mono">+${fmt(amountUSDT * takeProfit / 100)}</span>
                    </span>
                  </div>

                  {!dryRun && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                      ⚠️ <strong>LIVE MODE</strong> — Real funds will be used. Requires Binance API keys.
                    </div>
                  )}

                  <AnimatePresence>
                    {tradeError && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        ❌ {tradeError}
                      </motion.div>
                    )}
                    {tradeSuccess && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                        ✅ {tradeSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={executeTrade} disabled={tradeLoading || (analysis?.signal === "sell" && !dryRun)}
                    className={`w-full py-4 rounded-xl font-black text-base tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      dryRun ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "bg-gradient-to-r from-amber-500 to-orange-500 text-black"
                    }`}>
                    {tradeLoading ? "Executing..." : dryRun ? `🔵 Simulate Buy ${selectedSymbol.split("/")[0]}` : `🚀 LIVE BUY ${selectedSymbol.split("/")[0]}`}
                  </motion.button>

                  {/* Session trades */}
                  {trades.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-white/30 uppercase tracking-wider">Session Trades</p>
                      {trades.map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-xs p-2 bg-black/30 rounded-lg">
                          <span className="text-green-400 font-bold">{t.side.toUpperCase()}</span>
                          <span className="text-white/60 font-mono">{t.symbol}</span>
                          <span className="text-white/40">{t.amount.toFixed(6)}</span>
                          <span className="font-mono">${fmt(t.price)}</span>
                          <span className={`px-2 py-0.5 rounded-full ${t.status === "filled" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Signal card */}
                <div className="space-y-4">
                  {analysisLoading ? (
                    <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                  ) : analysis ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                      <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider">Live Indicators</h3>
                      <RSIBar rsi={analysis.rsi14} />
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-white/40">EMA 20</span>
                          <span className={`font-mono font-bold ${analysis.currentPrice > analysis.ema20 ? "text-green-400" : "text-red-400"}`}>
                            ${fmt(analysis.ema20)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-white/40">EMA 50</span>
                          <span className={`font-mono font-bold ${analysis.ema20 > analysis.ema50 ? "text-green-400" : "text-red-400"}`}>
                            ${fmt(analysis.ema50)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                          <span className="text-white/40">Trend</span>
                          <span className={`font-bold capitalize ${trendColors[analysis.trend]}`}>{analysis.trend}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-white/40">Signal</span>
                          <span className={`font-black uppercase ${signalColors[analysis.signal]}`}>{analysis.signal}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Strength</p>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.trendStrength}%` }} transition={{ duration: 1 }}
                            className="h-full rounded-full" style={{ background: color }} />
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {sizing && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider mb-3">Risk Sizing</h3>
                      <div className="space-y-2 text-xs">
                        {[
                          ["Account", `$${fmt(sizing.accountBalance)}`],
                          ["Risk %", `${sizing.riskPercent}%`],
                          ["Risk $", `$${fmt(sizing.riskAmount)}`],
                          ["Position", `$${fmt(sizing.positionSizeUSDT)}`],
                          ["R/R", `1 : ${sizing.riskRewardRatio.toFixed(1)}`],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                            <span className="text-white/40">{label}</span>
                            <span className="font-mono font-semibold">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== STRATEGY TAB ===== */}
            {activeTab === "strategy" && (
              <motion.div key="strategy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Strategy Config */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                  <h2 className="font-bold text-lg">Risk Engine Config</h2>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Account Balance (USDT)</span>
                      <span className="text-white font-mono">${fmt(accountBalance)}</span>
                    </label>
                    <input type="number" value={accountBalance} onChange={(e) => setAccountBalance(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50 text-sm" />
                  </div>

                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                      <span>Risk Per Trade</span>
                      <span className="text-amber-400 font-mono">{riskPercent}% = ${fmt(accountBalance * riskPercent / 100)}</span>
                    </label>
                    <input type="range" min={0.5} max={10} step={0.5} value={riskPercent}
                      onChange={(e) => setRiskPercent(Number(e.target.value))} className="w-full accent-amber-500" />
                    <div className="flex justify-between text-xs text-white/25 mt-1">
                      <span>Conservative 0.5%</span><span>Aggressive 10%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-black/30 border border-white/10 rounded-xl space-y-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Strategy Rules Active</p>
                    {[
                      { on: true, text: "EMA 20/50 trend filter — only trade with trend direction" },
                      { on: true, text: "RSI 14 overbought filter — skip entries above RSI 70" },
                      { on: true, text: "Risk-based position sizing — size calculated from risk %" },
                      { on: true, text: "Stop-loss protection — hard exit at defined loss level" },
                      { on: true, text: "Take-profit target — automatic exit at profit level" },
                      { on: false, text: "OCO orders (requires Binance API keys for live mode)" },
                      { on: false, text: "Multi-timeframe confirmation (coming soon)" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={r.on ? "text-green-400 mt-0.5" : "text-white/20 mt-0.5"}>
                          {r.on ? "✓" : "○"}
                        </span>
                        <span className={r.on ? "text-white/70" : "text-white/25"}>{r.text}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => fetchAnalysis(selectedSymbol)}
                    className="w-full py-3 rounded-xl border border-amber-500/40 text-amber-400 font-bold text-sm hover:bg-amber-500/10 transition-all">
                    {analysisLoading ? "Analyzing..." : `🔍 Re-analyze ${selectedSymbol.split("/")[0]}`}
                  </button>
                </div>

                {/* Full analysis */}
                <div className="space-y-4">
                  {analysis && (
                    <>
                      <div className={`p-5 rounded-2xl border ${signalBgs[analysis.signal]}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold">Market Signal</h3>
                          <span className={`text-2xl font-black uppercase ${signalColors[analysis.signal]}`}>{analysis.signal}</span>
                        </div>
                        <p className="text-sm text-white/70">{analysis.signalReason}</p>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                        <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider">Technical Indicators</h3>
                        <RSIBar rsi={analysis.rsi14} />
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            { label: "Price vs EMA20", value: `${((analysis.currentPrice - analysis.ema20) / analysis.ema20 * 100).toFixed(2)}%`, positive: analysis.currentPrice > analysis.ema20 },
                            { label: "EMA20 vs EMA50", value: `${((analysis.ema20 - analysis.ema50) / analysis.ema50 * 100).toFixed(2)}%`, positive: analysis.ema20 > analysis.ema50 },
                            { label: "EMA 20", value: `$${fmt(analysis.ema20)}`, positive: analysis.currentPrice > analysis.ema20 },
                            { label: "EMA 50", value: `$${fmt(analysis.ema50)}`, positive: analysis.ema20 > analysis.ema50 },
                          ].map((item) => (
                            <div key={item.label} className="p-3 bg-black/30 rounded-xl border border-white/10">
                              <p className="text-white/30 text-xs mb-1">{item.label}</p>
                              <p className={`font-mono font-bold ${item.positive ? "text-green-400" : "text-red-400"}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <MiniChart prices={analysis.prices} color={color} />
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ===== HISTORY TAB ===== */}
            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-4">

                {/* Stats grid */}
                {stats && stats.totalTrades > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Total Trades", value: stats.totalTrades, color: "text-white" },
                        { label: "Win Rate", value: `${(stats.winRate * 100).toFixed(1)}%`, color: stats.winRate >= 0.5 ? "text-green-400" : "text-red-400" },
                        { label: "Gross P&L", value: `${stats.grossPnl >= 0 ? "+" : ""}$${fmt(stats.grossPnl)}`, color: stats.grossPnl >= 0 ? "text-green-400" : "text-red-400" },
                        { label: "Profit Factor", value: stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2), color: stats.profitFactor >= 1 ? "text-green-400" : "text-red-400" },
                        { label: "Avg Win", value: `+$${fmt(stats.avgWin)}`, color: "text-green-400" },
                        { label: "Avg Loss", value: `-$${fmt(stats.avgLoss)}`, color: "text-red-400" },
                        { label: "Expectancy", value: `${stats.expectancy >= 0 ? "+" : ""}$${fmt(stats.expectancy)}`, color: stats.expectancy >= 0 ? "text-green-400" : "text-red-400" },
                        { label: "Current Streak", value: stats.currentStreak > 0 ? `+${stats.currentStreak}W` : `${Math.abs(stats.currentStreak)}L`, color: stats.currentStreak >= 0 ? "text-green-400" : "text-red-400" },
                      ].map((s) => (
                        <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                          <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">{s.label}</p>
                          <p className={`text-xl font-black font-mono ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {history.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                          <h3 className="font-bold text-sm">Recent Trades</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                          {history.map((t) => (
                            <div key={t.id} className="flex items-center gap-4 p-4 text-sm">
                              <span className={`font-bold w-8 ${t.outcome === "win" ? "text-green-400" : t.outcome === "loss" ? "text-red-400" : "text-amber-400"}`}>
                                {t.outcome === "win" ? "W" : t.outcome === "loss" ? "L" : "○"}
                              </span>
                              <span className="text-white/60 font-mono w-20">{t.symbol}</span>
                              <span className="text-white/40 text-xs">{timeAgo(t.timestamp)}</span>
                              <span className="flex-1 text-right font-mono">
                                ${fmt(t.entryPrice)} {t.exitPrice && `→ $${fmt(t.exitPrice)}`}
                              </span>
                              {t.pnl !== undefined && (
                                <span className={`font-mono font-bold ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {t.pnl >= 0 ? "+" : ""}${fmt(t.pnl)}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${t.dryRun ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                                {t.dryRun ? "sim" : "live"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 text-white/30">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="font-semibold">No trade history yet</p>
                    <p className="text-sm mt-1">Execute trades in the Trade tab to see P&L stats here</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== WALLET TAB ===== */}
            {activeTab === "wallet" && (
              <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4">SpotX Wallet</h2>
                  <div className="space-y-2 text-sm mb-6">
                    {[{ label: "USDT", value: 0 }, { label: "BTC", value: 0 }, { label: "ETH", value: 0 }].map((b) => (
                      <div key={b.label} className="flex justify-between py-2 border-b border-white/10 last:border-0">
                        <span className="text-white/50">{b.label}</span>
                        <span className="font-mono">{b.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {!tradeStatus?.connected && (
                    <p className="text-xs text-white/30 text-center">Add Binance API keys to see live balance</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-[#1a1060] to-[#0d0a30] border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💳</span>
                    <h2 className="font-bold text-purple-300 text-lg">SumUp Deposit</h2>
                  </div>
                  <p className="text-white/50 text-sm mb-5">Deposit fiat via SumUp — optimised for Italy & EU markets. Card, Apple Pay, Google Pay.</p>

                  {tradeStatus?.sumupConfigured && tradeStatus.sumupLink ? (
                    <motion.a href={tradeStatus.sumupLink} target="_blank" rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="block w-full py-4 text-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-lg transition-all">
                      Deposit via SumUp →
                    </motion.a>
                  ) : (
                    <div>
                      <button disabled className="w-full py-4 rounded-xl bg-purple-600/20 text-purple-300/40 font-black text-lg cursor-not-allowed">
                        Deposit via SumUp
                      </button>
                      <p className="text-xs text-white/30 text-center mt-2">
                        Add <code className="text-purple-400">SUMUP_PAYMENT_LINK</code> to Secrets to activate
                      </p>
                    </div>
                  )}

                  <div className="mt-5 space-y-2 text-xs text-white/40">
                    {["Visa, Mastercard, Amex", "Apple Pay & Google Pay", "SEPA bank transfer (EU)"].map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
