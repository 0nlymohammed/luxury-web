import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE = "luxury_admin_session";

function sign(value: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function createSessionToken(): string {
  const payload = `${Date.now() + SESSION_MAX_AGE_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !SESSION_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export function checkPassword(candidate: string): boolean {
  const actual = process.env.ADMIN_PASSWORD || "";
  if (!actual || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(actual);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
