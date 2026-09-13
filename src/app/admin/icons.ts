export const ICON_KEYS = [
  "code", "shield", "monitor", "cpu", "server", "users", "badge", "blocks",
  "zap", "trend", "lock", "building", "plane", "utensils", "briefcase",
  "chart", "landmark", "circuit", "refresh", "check", "search", "pen",
  "rocket", "headset", "filecheck", "bars", "archive", "globe", "calendar",
] as const;

export const FIELD_LABELS: Record<string, string> = {
  ic: "Icon",
  n: "Number label",
  ar: "Title (Arabic)",
  en: "Title (English)",
  dAr: "Description (Arabic)",
  dEn: "Description (English)",
  ia: "Feature list (Arabic) — one per line",
  ie: "Feature list (English) — one per line",
  g: "Tag",
};

export const KEY_ORDER = ["ic", "n", "ar", "en", "dAr", "dEn", "ia", "ie", "g"];
