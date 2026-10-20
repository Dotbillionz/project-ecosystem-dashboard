import { type NextFunction, type Request, type Response } from "express";
import { env, type CrownOpsRole } from "../config/env";

const roleWeight: Record<CrownOpsRole, number> = {
  viewer: 1,
  operator: 2,
  executive: 3,
};

/**
 * Authorization must depend only on the authenticated server-side identity.
 * Never derive privileges from client-controlled headers such as x-crownops-role.
 * Operator assignment is intentionally not inferred until an authenticated
 * role store or trusted identity-provider claim is implemented.
 */
function getUserRole(req: Request): CrownOpsRole | null {
  if (!req.isAuthenticated()) return null;

  const userEmail = req.user.email?.trim().toLowerCase();
  if (userEmail && env.ctoAdminEmails.some((email) => email.trim().toLowerCase() === userEmail)) {
    return "executive";
  }

  return "viewer";
}

export function requireRole(minRole: CrownOpsRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = getUserRole(req);
    if (!userRole) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    if (roleWeight[userRole] < roleWeight[minRole]) {
      res.status(403).json({
        success: false,
        error: `Role ${minRole} required`,
      });
      return;
    }

    res.locals["role"] = userRole;
    next();
  };
}
