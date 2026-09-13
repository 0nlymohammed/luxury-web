import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Secure cookies are only honored by the browser over HTTPS. Behind nginx
  // with a real domain, X-Forwarded-Proto is "https"; accessed directly over
  // plain HTTP (e.g. by IP, before DNS/TLS is set up) it isn't — so derive
  // the flag from the actual request instead of hardcoding it to NODE_ENV.
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  const secure = proto === "https";

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
