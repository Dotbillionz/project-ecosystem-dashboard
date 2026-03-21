import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const sessionsTable = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const walletsTable = pgTable("wallets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  balanceUSDT: numeric("balance_usdt", { precision: 18, scale: 8 })
    .notNull()
    .default("0"),
  lockedUSDT: numeric("locked_usdt", { precision: 18, scale: 8 })
    .notNull()
    .default("0"),
  totalDeposited: numeric("total_deposited", { precision: 18, scale: 8 })
    .notNull()
    .default("0"),
  totalWithdrawn: numeric("total_withdrawn", { precision: 18, scale: 8 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userSettingsTable = pgTable("user_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  copyTradingEnabled: boolean("copy_trading_enabled").notNull().default(false),
  riskLevel: numeric("risk_level", { precision: 5, scale: 4 })
    .notNull()
    .default("0.02"),
  maxDailyLossPercent: numeric("max_daily_loss_percent", {
    precision: 5,
    scale: 4,
  })
    .notNull()
    .default("0.05"),
  performanceFeePercent: numeric("performance_fee_percent", {
    precision: 5,
    scale: 4,
  })
    .notNull()
    .default("0.20"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tradeHistoryTable = pgTable("trade_history", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  symbol: varchar("symbol").notNull(),
  side: varchar("side", { enum: ["buy", "sell"] }).notNull(),
  entryPrice: numeric("entry_price", { precision: 18, scale: 8 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 18, scale: 8 }),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  costUSDT: numeric("cost_usdt", { precision: 18, scale: 8 }).notNull(),
  stopLossPrice: numeric("stop_loss_price", { precision: 18, scale: 8 }).notNull(),
  takeProfitPrice: numeric("take_profit_price", { precision: 18, scale: 8 }).notNull(),
  pnl: numeric("pnl", { precision: 18, scale: 8 }),
  pnlPercent: numeric("pnl_percent", { precision: 10, scale: 6 }),
  outcome: varchar("outcome", { enum: ["win", "loss", "open"] })
    .notNull()
    .default("open"),
  dryRun: boolean("dry_run").notNull().default(true),
  trendSignal: varchar("trend_signal"),
  rsiAtEntry: numeric("rsi_at_entry", { precision: 6, scale: 2 }),
  isCopyTrade: boolean("is_copy_trade").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
export type Wallet = typeof walletsTable.$inferSelect;
export type UserSettings = typeof userSettingsTable.$inferSelect;
export type TradeHistoryRecord = typeof tradeHistoryTable.$inferSelect;
