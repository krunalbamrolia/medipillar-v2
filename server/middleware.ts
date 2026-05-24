import type { Request, Response, NextFunction } from "express";
import { getSupabaseAdmin } from "./supabase";
import { storage } from "./storage";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const user = await storage.getUser(req.session.userId as string);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Account deactivated. Contact support." });
    }
    next();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function verifySupabaseAccessToken(
  accessToken: string,
): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user.id;
}
