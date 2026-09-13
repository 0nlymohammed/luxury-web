import "./legacy.css";
import NewsShell from "./NewsShell";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <NewsShell>{children}</NewsShell>;
}
