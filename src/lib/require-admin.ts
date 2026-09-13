import { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export function requireAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
