export const env = {
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  appBaseUrl: process.env["APP_BASE_URL"] ?? "http://localhost:5173",
  githubWebhookSecret: process.env["GITHUB_WEBHOOK_SECRET"] ?? "",
  githubToken: process.env["GITHUB_TOKEN"] ?? "",
  githubWorkflowDispatchRef: process.env["GITHUB_WORKFLOW_DISPATCH_REF"] ?? "main",
  githubWorkflowFile: process.env["GITHUB_WORKFLOW_FILE"] ?? "ci.yml",
  githubRepository: process.env["GITHUB_REPOSITORY"] ?? "",
  slackWebhookUrl: process.env["SLACK_WEBHOOK_URL"] ?? "",
  telegramBotToken: process.env["TELEGRAM_BOT_TOKEN"] ?? "",
  telegramChatId: process.env["TELEGRAM_CHAT_ID"] ?? "",
  notionApiToken: process.env["NOTION_API_TOKEN"] ?? "",
  notionDatabaseId: process.env["NOTION_DATABASE_ID"] ?? "",
  stripeApiKey: process.env["STRIPE_API_KEY"] ?? "",
  coinbaseCommerceApiKey: process.env["COINBASE_COMMERCE_API_KEY"] ?? "",
  nowPaymentsApiKey: process.env["NOWPAYMENTS_API_KEY"] ?? "",
  binancePayApiKey: process.env["BINANCE_PAY_API_KEY"] ?? "",
  spotxApiKey: process.env["SPOTX_API_KEY"] ?? "",
  sumupGiftCardToken: process.env["SUMUP_GIFTCARD_TOKEN"] ?? "",
  ctoAdminEmails: (process.env["CTO_ADMIN_EMAILS"] ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};

export type CrownOpsRole = "viewer" | "operator" | "executive";
