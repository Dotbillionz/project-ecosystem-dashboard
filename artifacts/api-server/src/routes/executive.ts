import { Router, type IRouter } from "express";
import { buildExecutiveBriefing } from "../lib/crownops/executive-briefing";
import { requireRole } from "../middlewares/requireRole";

const router: IRouter = Router();

router.get("/executive/briefing", requireRole("executive"), (_req, res) => {
  const briefing = buildExecutiveBriefing();
  res.json({ success: true, briefing });
});

router.get("/executive/status", requireRole("operator"), (_req, res) => {
  const briefing = buildExecutiveBriefing();
  res.json({
    success: true,
    status: {
      generatedAt: briefing.generatedAt,
      integrationCoverage: briefing.integrationStatus.filter((item) => item.configured).length,
      integrationTotal: briefing.integrationStatus.length,
      alerts: briefing.alerts,
    },
  });
});

export default router;
