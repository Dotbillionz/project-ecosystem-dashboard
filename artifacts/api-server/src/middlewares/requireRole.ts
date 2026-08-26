import { type NextFunction, type Request, type Response } from "express";
import { env, type CrownOpsRole } from "../config/env";

const roleWeight: Record<CrownOpsRole, number> = {
  viewer: 1,
  operator: 2,
  executive: 3,
};

function getUserRole(req: Request): CrownOpsRole {
  const headerRole = req.headers["x-crownops-role"];
  if (headerRole === "executive" || headerRole === "operator" || headerRole === "viewer") {
    return headerRole;
  }

  const maybeEmail = (req.user as { email?: string } | undefined)?.email;
  const userEmail = maybeEmail?.toLowerCase();
  if (userEmail && env.ctoAdminEmails.includes(userEmail)) {
    return "executive";
  }

  return "viewer";
}

export function requireRole(minRole: CrownOpsRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = getUserRole(req);

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
