import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { readNews, readSite } from "@/lib/store";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!authed) return <LoginForm />;

  const [site, news] = await Promise.all([readSite(), readNews()]);
  return <Dashboard initialSite={site} initialNews={news} />;
}
