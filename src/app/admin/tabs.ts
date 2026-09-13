export type TabConfig = {
  key: string;
  label: string;
  section?: string; // matches SiteContent.fields[x].section
  arrayKey?: string; // matches SiteContent.arrays[x]
  plainKeys?: { key: string; label: string }[];
};

export const TABS: TabConfig[] = [
  { key: "nav", label: "Navigation", section: "nav" },
  { key: "hero", label: "Hero", section: "hero" },
  { key: "about", label: "About", section: "about", arrayKey: "about" },
  { key: "services", label: "Services", section: "services", arrayKey: "services" },
  { key: "security", label: "Security", section: "security", arrayKey: "sec" },
  { key: "ai", label: "AI", section: "ai", arrayKey: "ai" },
  { key: "work", label: "Work", section: "work", arrayKey: "work" },
  { key: "why", label: "Why Us", section: "why", arrayKey: "why" },
  { key: "sectors", label: "Sectors", section: "sectors", arrayKey: "sectors" },
  { key: "process", label: "Process", section: "process", arrayKey: "proc" },
  { key: "news-copy", label: "News Section Text", section: "news" },
  {
    key: "contact",
    label: "Contact",
    section: "contact",
    plainKeys: [{ key: "contact.email", label: "Contact email" }],
  },
  {
    key: "footer",
    label: "Footer",
    section: "footer",
    plainKeys: [
      { key: "footer.email", label: "Footer email" },
      { key: "footer.tagline", label: "Footer tagline (Latin)" },
      { key: "footer.copyrightPrefix", label: "Copyright prefix" },
    ],
  },
];
