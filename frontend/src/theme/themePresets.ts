// ─────────────────────────────────────────────────
//  Theme Presets
//  Single source of truth for ThemeConfig type and all built-in themes.
//  Every field maps directly to a CSS custom property applied on the canvas.
// ─────────────────────────────────────────────────

export interface ThemeConfig {
  id:            string
  name:          string
  /** Background of the outer scroll / page area */
  canvasBg:      string
  /** Background of the dashboard card itself */
  dashboardBg:   string
  /** Widget card background  →  --surface */
  widgetBg:      string
  /** Widget card border colour  →  --border */
  widgetBorder:  string
  /** Widget card corner radius in px  →  --radius-lg */
  widgetRadius:  number
  /** Primary text colour  →  --text */
  textColor:     string
  /** Secondary / label text colour  →  --text2 */
  textSecondary: string
  /** Muted / placeholder text colour  →  --text3 */
  textMuted:     string
  /** Accent colour (KPI values, active borders, buttons)  →  --accent */
  accentColor:   string
  /** Font family applied to the entire canvas */
  fontFamily:    string
  /** 6-colour chart palette used by all chart widgets */
  chartPalette:  string[]
}

export const PRESET_THEMES: ThemeConfig[] = [
  {
    id: "default", name: "Default",
    canvasBg: "#f4f5f7", dashboardBg: "#f4f6f9",
    widgetBg: "#ffffff", widgetBorder: "#e2e8f0", widgetRadius: 8,
    textColor: "#1e293b", textSecondary: "#64748b", textMuted: "#94a3b8",
    accentColor: "#005EB8",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#2b7cff", "#34a853", "#fbbc05", "#ea4335", "#a142f4", "#ff6d00"],
  },
  {
    id: "slate", name: "Slate",
    canvasBg: "#f1f5f9", dashboardBg: "#f8fafc",
    widgetBg: "#ffffff", widgetBorder: "#cbd5e1", widgetRadius: 8,
    textColor: "#0f172a", textSecondary: "#475569", textMuted: "#94a3b8",
    accentColor: "#334155",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#334155", "#64748b", "#0f172a", "#94a3b8", "#475569", "#1e293b"],
  },
  {
    id: "ocean", name: "Ocean",
    canvasBg: "#e0f2fe", dashboardBg: "#f0f9ff",
    widgetBg: "#ffffff", widgetBorder: "#bae6fd", widgetRadius: 10,
    textColor: "#0c4a6e", textSecondary: "#0369a1", textMuted: "#7dd3fc",
    accentColor: "#0284c7",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#0369a1", "#0c4a6e"],
  },
  {
    id: "forest", name: "Forest",
    canvasBg: "#f0fdf4", dashboardBg: "#f7fef9",
    widgetBg: "#ffffff", widgetBorder: "#bbf7d0", widgetRadius: 8,
    textColor: "#14532d", textSecondary: "#15803d", textMuted: "#86efac",
    accentColor: "#16a34a",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#15803d", "#14532d"],
  },
  {
    id: "sunset", name: "Sunset",
    canvasBg: "#fff7ed", dashboardBg: "#fffbf5",
    widgetBg: "#ffffff", widgetBorder: "#fed7aa", widgetRadius: 8,
    textColor: "#431407", textSecondary: "#c2410c", textMuted: "#fdba74",
    accentColor: "#ea580c",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#c2410c", "#9a3412"],
  },
  {
    id: "rose", name: "Rose",
    canvasBg: "#fff1f2", dashboardBg: "#fff5f6",
    widgetBg: "#ffffff", widgetBorder: "#fecdd3", widgetRadius: 8,
    textColor: "#881337", textSecondary: "#be123c", textMuted: "#fda4af",
    accentColor: "#e11d48",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#e11d48", "#f43f5e", "#fb7185", "#fda4af", "#be123c", "#881337"],
  },
  {
    id: "midnight", name: "Midnight",
    canvasBg: "#0f172a", dashboardBg: "#1e293b",
    widgetBg: "#1e293b", widgetBorder: "#334155", widgetRadius: 8,
    textColor: "#f1f5f9", textSecondary: "#94a3b8", textMuted: "#475569",
    accentColor: "#38bdf8",
    fontFamily: "Inter, Arial, sans-serif",
    chartPalette: ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c"],
  },
]

export const DEFAULT_THEME: ThemeConfig = PRESET_THEMES[0]
