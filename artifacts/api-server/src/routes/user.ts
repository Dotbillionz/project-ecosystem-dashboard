import { Router, type IRouter, type Request, type Response } from "express";
import { db, walletsTable, userSettingsTable, tradeHistoryTable } from "@workspace/db";
import { eq, desc, sum, count, and } from "drizzle-orm";

const router: IRouter = Router();

async function getOrCreateWallet(userId: string) {
  const [existing] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(walletsTable)
    .values({ userId, balanceUSDT: "1000" })
    .returning();
  return created!;
}

async function getOrCreateSettings(userId: string) {
  const [existing] = await db
    .select()
    .from(userSettingsTable)
    .where(eq(userSettingsTable.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(userSettingsTable)
    .values({ userId })
    .returning();
  return created!;
}

router.get("/user/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const [wallet, settings] = await Promise.all([
      getOrCreateWallet(req.user.id),
      getOrCreateSettings(req.user.id),
    ]);

    res.json({
      success: true,
      user: req.user,
      wallet,
      settings,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user profile");
    res.status(500).json({ error: "Failed to load profile" });
  }
});

router.get("/user/stats", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const userId = req.user.id;

    const trades = await db
      .select()
      .from(tradeHistoryTable)
      .where(eq(tradeHistoryTable.userId, userId))
      .orderBy(desc(tradeHistoryTable.createdAt))
      .limit(50);

    const closed = trades.filter((t) => t.outcome !== "open");
    const wins = closed.filter((t) => t.outcome === "win");
    const losses = closed.filter((t) => t.outcome === "loss");

    const grossPnl = closed.reduce((s, t) => s + Number(t.pnl ?? 0), 0);
    const totalWinAmt = wins.reduce((s, t) => s + Number(t.pnl ?? 0), 0);
    const totalLossAmt = Math.abs(losses.reduce((s, t) => s + Number(t.pnl ?? 0), 0));
    const profitFactor = totalLossAmt > 0 ? totalWinAmt / totalLossAmt : totalWinAmt > 0 ? 999 : 0;
    const winRate = closed.length > 0 ? wins.length / closed.length : 0;
    const avgWin = wins.length > 0 ? totalWinAmt / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLossAmt / losses.length : 0;
    const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

    res.json({
      success: true,
      stats: {
        totalTrades: closed.length,
        wins: wins.length,
        losses: losses.length,
        winRate,
        grossPnl,
        profitFactor,
        avgWin,
        avgLoss,
        expectancy,
      },
      recentTrades: trades.slice(0, 10),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user stats");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.patch("/user/settings", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const {
      copyTradingEnabled,
      riskLevel,
      maxDailyLossPercent,
    } = req.body as {
      copyTradingEnabled?: boolean;
      riskLevel?: number;
      maxDailyLossPercent?: number;
    };

    const settings = await getOrCreateSettings(req.user.id);

    const updates: Partial<typeof settings> = {};
    if (typeof copyTradingEnabled === "boolean") updates.copyTradingEnabled = copyTradingEnabled;
    if (typeof riskLevel === "number") updates.riskLevel = String(Math.min(0.1, Math.max(0.001, riskLevel)));
    if (typeof maxDailyLossPercent === "number") updates.maxDailyLossPercent = String(Math.min(0.2, Math.max(0.01, maxDailyLossPercent)));

    const [updated] = await db
      .update(userSettingsTable)
      .set(updates)
      .where(eq(userSettingsTable.userId, req.user.id))
      .returning();

    res.json({ success: true, settings: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update settings");
    res.status(500).json({ error: "Failed to update settings" });
  }
});

router.post("/user/trade", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const {
      symbol, side, entryPrice, amount, costUSDT,
      stopLossPrice, takeProfitPrice, dryRun,
      trendSignal, rsiAtEntry, isCopyTrade,
    } = req.body as {
      symbol: string; side: "buy" | "sell"; entryPrice: number; amount: number;
      costUSDT: number; stopLossPrice: number; takeProfitPrice: number;
      dryRun?: boolean; trendSignal?: string; rsiAtEntry?: number; isCopyTrade?: boolean;
    };

    const [trade] = await db
      .insert(tradeHistoryTable)
      .values({
        userId: req.user.id,
        symbol,
        side,
        entryPrice: String(entryPrice),
        amount: String(amount),
        costUSDT: String(costUSDT),
        stopLossPrice: String(stopLossPrice),
        takeProfitPrice: String(takeProfitPrice),
        dryRun: dryRun ?? true,
        trendSignal: trendSignal ?? null,
        rsiAtEntry: rsiAtEntry != null ? String(rsiAtEntry) : null,
        isCopyTrade: isCopyTrade ?? false,
        outcome: "open",
      })
      .returning();

    res.json({ success: true, trade });
  } catch (err) {
    req.log.error({ err }, "Failed to record trade");
    res.status(500).json({ error: "Failed to record trade" });
  }
});

export default router;
