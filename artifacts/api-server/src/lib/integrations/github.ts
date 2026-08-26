import crypto from "crypto";
import { env } from "../../config/env";

export interface GitHubWebhookEvent {
  action?: string;
  repository?: {
    full_name?: string;
  };
  pull_request?: {
    html_url?: string;
    title?: string;
  };
  ref?: string;
}

export function verifyGitHubSignature(
  rawBody: string,
  signatureHeader: string | undefined,
): boolean {
  if (!env.githubWebhookSecret || !signatureHeader) return false;

  const digest = crypto
    .createHmac("sha256", env.githubWebhookSecret)
    .update(rawBody)
    .digest("hex");

  const expected = `sha256=${digest}`;
  const receivedBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function triggerGitHubWorkflow(
  eventType: string,
  payload: GitHubWebhookEvent,
): Promise<void> {
  if (!env.githubToken || !env.githubRepository) return;

  const endpoint = `https://api.github.com/repos/${env.githubRepository}/actions/workflows/${env.githubWorkflowFile}/dispatches`;

  await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.githubToken}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ref: env.githubWorkflowDispatchRef,
      inputs: {
        source_event: eventType,
        repository: payload.repository?.full_name ?? "unknown",
        action: payload.action ?? "unknown",
      },
    }),
  });
}
