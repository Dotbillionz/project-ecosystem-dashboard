import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";

interface Wallet {
  balanceUSDT: string;
  lockedUSDT: string;
  totalDeposited: string;
}

interface Settings {
  copyTradingEnabled: boolean;
  riskLevel: string;
  maxDailyLossPercent: string;
  performanceFeePercent: string;
}

interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  grossPnl: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: string;
  entryPrice: string;
  exitPrice?: string;
  amount: string;
  costUSDT: string;
  pnl?: string;
  pnlPercent?: string;
  outcome: string;
  dryRun: boolean;
  trendSignal?: string;
  isCopyTrade: boolean;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Tab = "overview" | "trades" | "copy" | "settings";

export function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copyEnabled, setCopyEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState(2);

  const fetchProfile = useCallback(async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch(`${API}/user/profile`, { credentials: "include" }),
        fetch(`${API}/user/stats`, { credentials: "include" }),
      ]);

      if (profileRes.ok) {
        const d = await profileRes.json();
        setWallet(d.wallet);
        setSettings(d.settings);
        setCopyEnabled(d.settings.copyTradingEnabled);
        setRiskLevel(Number(d.settings.riskLevel) * 100);
      }

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
        setTrades(d.recentTrades ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/user/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          copyTradingEnabled: copyEnabled,
          riskLevel: riskLevel / 100,
        }),
      });
      await fetchProfile();
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user?.email?.split("@")[0] ?? "Trader";

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "trades", label: "Trade History", icon: "📋" },
    { id: "copy", label: "Copy Trading", icon: "🔁" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#050a10] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#050a10] to-[#0a0510]" />
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] rounded-full blur-3xl opacity-5"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="text-white/40 hover:text-white transition-colors text-sm">← Dashboard</button>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2.5">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full border border-amber-500/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm leading-tight">{displayName}</p>
                  <p className="text-white/30 text-[10px]">{user?.email ?? "SpotX Member"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/spotx">
                <button className="px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/10 transition-all">
                  🚀 TradeBot
                </button>
              </Link>
              <button onClick={logout} className="text-white/30 hover:text-white text-xs transition-colors">
                Log out
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "border-amber-400 text-amber-400" : "border-transparent text-white/40 hover:text-white/70"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ===== OVERVIEW ===== */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-4">

                  {/* Balance cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5">
                      <p className="text-xs text-amber-400/60 uppercase tracking-wider mb-1">Available Balance</p>
                      <p className="text-3xl font-black text-amber-400">${fmt(Number(wallet?.balanceUSDT ?? 0))}</p>
                      <p className="text-xs text-white/30 mt-1">USDT</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total P&L</p>
                      <p className={`text-3xl font-black ${(stats?.grossPnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {(stats?.grossPnl ?? 0) >= 0 ? "+" : ""}${fmt(stats?.grossPnl ?? 0)}
                      </p>
                      <p className="text-xs text-white/30 mt-1">All closed trades</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Win Rate</p>
                      <p className={`text-3xl font-black ${(stats?.winRate ?? 0) >= 0.5 ? "text-green-400" : "text-red-400"}`}>
                        {((stats?.winRate ?? 0) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-white/30 mt-1">{stats?.wins ?? 0}W / {stats?.losses ?? 0}L of {stats?.totalTrades ?? 0} trades</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Profit Factor", value: stats?.profitFactor === 999 ? "∞" : fmt(stats?.profitFactor ?? 0), color: (stats?.profitFactor ?? 0) >= 1 ? "text-green-400" : "text-red-400" },
                      { label: "Avg Win", value: `+$${fmt(stats?.avgWin ?? 0)}`, color: "text-green-400" },
                      { label: "Avg Loss", value: `-$${fmt(stats?.avgLoss ?? 0)}`, color: "text-red-400" },
                      { label: "Expectancy", value: `${(stats?.expectancy ?? 0) >= 0 ? "+" : ""}$${fmt(stats?.expectancy ?? 0)}`, color: (stats?.expectancy ?? 0) >= 0 ? "text-green-400" : "text-red-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-xs text-white/30 mb-1">{s.label}</p>
                        <p className={`text-lg font-black font-mono ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Copy trading status */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${copyEnabled ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10"}`}>
                    <div>
                      <p className="font-bold text-sm">Copy Trading</p>
                      <p className="text-xs text-white/40 mt-0.5">{copyEnabled ? "Mirroring master trades automatically" : "Not active — enable in Settings"}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${copyEnabled ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/10 border-white/20 text-white/40"}`}>
                      {copyEnabled ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Open TradeBot", icon: "🚀", href: "/spotx", color: "amber" },
                      { label: "View History", icon: "📋", action: () => setActiveTab("trades"), color: "blue" },
                      { label: "Copy Trading", icon: "🔁", action: () => setActiveTab("copy"), color: "purple" },
                      { label: "Settings", icon: "⚙️", action: () => setActiveTab("settings"), color: "gray" },
                    ].map((a) => (
                      <motion.div key={a.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        {a.href ? (
                          <Link href={a.href}>
                            <button className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-center transition-all">
                              <span className="text-2xl block mb-1">{a.icon}</span>
                              <span className="text-xs text-white/60">{a.label}</span>
                            </button>
                          </Link>
                        ) : (
                          <button onClick={a.action} className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-center transition-all">
                            <span className="text-2xl block mb-1">{a.icon}</span>
                            <span className="text-xs text-white/60">{a.label}</span>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ===== TRADE HISTORY ===== */}
              {activeTab === "trades" && (
                <motion.div key="trades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {trades.length === 0 ? (
                    <div className="text-center py-20 text-white/30">
                      <p className="text-4xl mb-3">📋</p>
                      <p className="font-semibold">No trades recorded yet</p>
                      <p className="text-sm mt-1">Trades executed in the TradeBot are saved here automatically</p>
                      <Link href="/spotx">
                        <button className="mt-4 px-5 py-2 rounded-xl border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/10 transition-all">
                          Open TradeBot →
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-bold">Trade History</h3>
                        <span className="text-xs text-white/30">{trades.length} trades</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {trades.map((t) => {
                          const pnl = t.pnl ? Number(t.pnl) : undefined;
                          return (
                            <div key={t.id} className="flex items-center gap-3 p-4 text-sm hover:bg-white/5 transition-colors">
                              <span className={`font-black w-8 text-center ${t.outcome === "win" ? "text-green-400" : t.outcome === "loss" ? "text-red-400" : "text-amber-400"}`}>
                                {t.outcome === "win" ? "W" : t.outcome === "loss" ? "L" : "○"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white/80">{t.symbol}</span>
                                  <span className={`text-xs ${t.side === "buy" ? "text-green-400" : "text-red-400"}`}>{t.side.toUpperCase()}</span>
                                  {t.isCopyTrade && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">copy</span>}
                                  {t.dryRun && <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">sim</span>}
                                </div>
                                <p className="text-white/30 text-xs">${fmt(Number(t.entryPrice))}{t.exitPrice ? ` → $${fmt(Number(t.exitPrice))}` : ""}</p>
                              </div>
                              {pnl !== undefined ? (
                                <span className={`font-mono font-bold ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {pnl >= 0 ? "+" : ""}${fmt(pnl)}
                                </span>
                              ) : (
                                <span className="text-white/20 text-xs">Open</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ===== COPY TRADING ===== */}
              {activeTab === "copy" && (
                <motion.div key="copy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 max-w-xl">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                    <div>
                      <h2 className="font-bold text-lg">Copy Trading</h2>
                      <p className="text-sm text-white/40 mt-1">Mirror master trades proportional to your balance. A 20% performance fee applies on profits.</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10">
                      <div>
                        <p className="font-semibold text-sm">Enable Copy Trading</p>
                        <p className="text-xs text-white/30 mt-0.5">{copyEnabled ? "Your balance mirrors master trades" : "Off — you trade manually"}</p>
                      </div>
                      <button onClick={() => setCopyEnabled(!copyEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${copyEnabled ? "bg-green-500" : "bg-white/20"}`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${copyEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                        <span>Risk Per Trade</span>
                        <span className="text-amber-400 font-mono">{riskLevel.toFixed(1)}%</span>
                      </label>
                      <input type="range" min={0.5} max={10} step={0.5} value={riskLevel}
                        onChange={(e) => setRiskLevel(Number(e.target.value))}
                        className="w-full accent-amber-500" />
                      <div className="flex justify-between text-xs text-white/25 mt-1">
                        <span>Conservative 0.5%</span><span>Aggressive 10%</span>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400/80 space-y-1">
                      <p className="font-semibold text-amber-400">How copy trading works:</p>
                      <p>1. Master trader executes a signal trade</p>
                      <p>2. Your position is sized proportionally to your balance × risk %</p>
                      <p>3. Same stop-loss and take-profit levels apply</p>
                      <p>4. 20% performance fee is deducted from profitable trades</p>
                    </div>

                    <button onClick={saveSettings} disabled={saving}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold transition-all">
                      {saving ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== SETTINGS ===== */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h2 className="font-bold text-lg">Account</h2>
                    <div className="flex items-center gap-3">
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="" className="w-12 h-12 rounded-full border border-amber-500/30" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
                          {displayName[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{displayName}</p>
                        <p className="text-white/30 text-xs">{user?.email ?? "—"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[
                        { label: "Member ID", value: user?.id?.slice(0, 12) + "..." },
                        { label: "Performance Fee", value: `${Number(settings?.performanceFeePercent ?? 0.2) * 100}%` },
                        { label: "Daily Loss Limit", value: `${Number(settings?.maxDailyLossPercent ?? 0.05) * 100}%` },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-white/40">{item.label}</span>
                          <span className="font-mono text-white/70">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h2 className="font-bold text-lg">Risk Settings</h2>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                        <span>Risk Per Trade</span>
                        <span className="text-amber-400 font-mono">{riskLevel.toFixed(1)}%</span>
                      </label>
                      <input type="range" min={0.5} max={10} step={0.5} value={riskLevel}
                        onChange={(e) => setRiskLevel(Number(e.target.value))} className="w-full accent-amber-500" />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                        Copy Trading
                      </label>
                      <button onClick={() => setCopyEnabled(!copyEnabled)}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all ${copyEnabled ? "border-green-500/30 bg-green-500/10" : "border-white/10 bg-white/5"}`}>
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${copyEnabled ? "bg-green-500" : "bg-white/20"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${copyEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                        <span className={`text-sm font-semibold ${copyEnabled ? "text-green-400" : "text-white/40"}`}>
                          {copyEnabled ? "Copy Trading ON" : "Copy Trading OFF"}
                        </span>
                      </button>
                    </div>

                    <button onClick={saveSettings} disabled={saving}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold transition-all">
                      {saving ? "Saving..." : "Save Settings"}
                    </button>

                    <button onClick={logout}
                      className="w-full py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-sm transition-all">
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
