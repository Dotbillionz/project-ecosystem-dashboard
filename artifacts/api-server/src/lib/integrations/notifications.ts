import { env } from "../../config/env";

export interface AlertPayload {
  title: string;
  severity: "info" | "warning" | "critical";
  message: string;
  source: string;
}

async function notifySlack(payload: AlertPayload): Promise<void> {
  if (!env.slackWebhookUrl) return;

  await fetch(env.slackWebhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: `*[${payload.severity.toUpperCase()}]* ${payload.title}\n${payload.message}\nsource: ${payload.source}`,
    }),
  });
}

async function notifyTelegram(payload: AlertPayload): Promise<void> {
  if (!env.telegramBotToken || !env.telegramChatId) return;

  const endpoint = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;
  const text = `[${payload.severity.toUpperCase()}] ${payload.title}\n${payload.message}\nsource: ${payload.source}`;

  await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: env.telegramChatId,
      text,
    }),
  });
}

export async function dispatchOpsAlert(payload: AlertPayload): Promise<void> {
  await Promise.allSettled([notifySlack(payload), notifyTelegram(payload)]);
}
