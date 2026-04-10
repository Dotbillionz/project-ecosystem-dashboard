import { Router, type IRouter } from "express";
import { dispatchOpsAlert } from "../lib/integrations/notifications";
import {
  triggerGitHubWorkflow,
  verifyGitHubSignature,
  type GitHubWebhookEvent,
} from "../lib/integrations/github";

const router: IRouter = Router();

router.post("/integrations/github/webhook", async (req, res) => {
  const eventType = req.headers["x-github-event"];
  const signature = req.headers["x-hub-signature-256"];
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";

  if (typeof eventType !== "string") {
    res.status(400).json({ success: false, error: "Missing x-github-event header" });
    return;
  }

  if (!rawBody) {
    res.status(400).json({ success: false, error: "Missing raw payload" });
    return;
  }

  if (!verifyGitHubSignature(rawBody, typeof signature === "string" ? signature : undefined)) {
    res.status(401).json({ success: false, error: "Invalid webhook signature" });
    return;
  }

  const payload = JSON.parse(rawBody) as GitHubWebhookEvent;

  await triggerGitHubWorkflow(eventType, payload);

  if (eventType === "pull_request" && payload.action === "opened") {
    await dispatchOpsAlert({
      title: "New PR requires AI review",
      severity: "info",
      source: "github-webhook",
      message: `${payload.pull_request?.title ?? "PR"} - ${payload.pull_request?.html_url ?? ""}`,
    });
  }

  res.status(202).json({ success: true, status: "accepted" });
});

router.post("/integrations/alerts/test", async (req, res) => {
  const body = req.body as { title?: string; message?: string };

  await dispatchOpsAlert({
    title: body.title ?? "CrownOps test alert",
    message: body.message ?? "This is a test notification from CrownOps control plane.",
    severity: "info",
    source: "api-test",
  });

  res.json({ success: true });
});

export default router;
