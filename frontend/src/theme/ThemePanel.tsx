import { useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { PRESET_THEMES, DEFAULT_THEME, type ThemeConfig } from "./themePresets"

function ThemePreview({ theme }: { theme: ThemeConfig }) {
  const p = theme.chartPalette
  const r = Math.min(theme.widgetRadius, 6)

  return (
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect width="200" height="130" fill={theme.dashboardBg} />

      <rect x="10" y="11" width="72" height="7" rx="2" fill={theme.textColor} opacity="0.88" />
      <rect x="10" y="22" width="104" height="3" rx="1" fill={theme.textSecondary} opacity="0.45" />
      <rect x="10" y="28" width="82"  height="3" rx="1" fill={theme.textSecondary} opacity="0.3" />

      <rect x="8" y="38" width="116" height="84" rx={r} fill={theme.widgetBg} stroke={theme.widgetBorder} strokeWidth="0.8" />
      <rect x="16" y="46" width="50"  height="4" rx="1" fill={theme.textColor} opacity="0.55" />
      <rect x="20" y="86" width="13" height="27" rx="1" fill={p[0]} />
      <rect x="37" y="73" width="13" height="40" rx="1" fill={p[1]} />
      <rect x="54" y="80" width="13" height="33" rx="1" fill={p[2]} />
      <rect x="71" y="67" width="13" height="46" rx="1" fill={p[3] || p[0]} />
      <rect x="88" y="76" width="13" height="37" rx="1" fill={p[4] || p[1]} />
      <line x1="16" y1="113" x2="108" y2="113" stroke={theme.widgetBorder} strokeWidth="0.8" />

      <rect x="130" y="38" width="62" height="38" rx={r} fill={theme.widgetBg} stroke={theme.widgetBorder} strokeWidth="0.8" />
      <rect x="138" y="46" width="30" height="3"  rx="1" fill={theme.textSecondary} opacity="0.5" />
      <rect x="138" y="53" width="28" height="11" rx="2" fill={theme.accentColor}   opacity="0.85" />
      <rect x="138" y="67" width="18" height="3"  rx="1" fill={theme.textMuted}     opacity="0.4" />

      <rect x="130" y="84" width="62" height="38" rx={r} fill={theme.widgetBg} stroke={theme.widgetBorder} strokeWidth="0.8" />
      <circle cx="150" cy="103" r="12" fill="none" stroke={p[0]} strokeWidth="7" strokeDasharray="26 50" />
      <circle cx="150" cy="103" r="12" fill="none" stroke={p[1]} strokeWidth="7" strokeDasharray="18 58" strokeDashoffset="-26" />
      <circle cx="150" cy="103" r="12" fill="none" stroke={p[2]} strokeWidth="7" strokeDasharray="9 65"  strokeDashoffset="-44" />
      <circle cx="150" cy="103" r="4" fill={theme.widgetBg} />
      <rect x="167" y="95"  width="4" height="4" rx="1" fill={p[0]} />
      <rect x="173" y="96"  width="14" height="2" rx="1" fill={theme.textSecondary} opacity="0.4" />
      <rect x="167" y="103" width="4" height="4" rx="1" fill={p[1]} />
      <rect x="173" y="104" width="10" height="2" rx="1" fill={theme.textSecondary} opacity="0.35" />
    </svg>
  )
}

const FONT_OPTIONS = [
  { label: "Inter",        value: "Inter, Arial, sans-serif"           },
  { label: "Roboto",       value: "Roboto, Arial, sans-serif"          },
  { label: "Georgia",      value: "Georgia, 'Times New Roman', serif"  },
  { label: "Courier",      value: "'Courier New', Courier, monospace"  },
  { label: "System UI",    value: "system-ui, -apple-system, sans-serif" },
]

const SIZE_PRESETS = [
  { label: "HD  (1280 × 720)",       w: 1280, h: 720  },
  { label: "Full HD  (1920 × 1080)", w: 1920, h: 1080 },
  { label: "A4 Portrait",            w: 794,  h: 1123 },
  { label: "Square  (1000 × 1000)",  w: 1000, h: 1000 },
]

export default function ThemePanel() {

  const dashboard    = useDashboardStore(s => s.dashboard)
  const setTheme     = useDashboardStore(s => s.setTheme)
  const updateCanvas = useDashboardStore(s => s.updateCanvas)
  const setCanvasBg  = useDashboardStore(s => s.setCanvasBg)

  const currentTheme = dashboard.theme ?? DEFAULT_THEME

  const [subTab, setSubTab] = useState<"theme" | "layout">("theme")

  const [custom, setCustom] = useState<ThemeConfig>({
    ...currentTheme,
    id:   "custom",
    name: "Custom",
  })

  function applyPreset(t: ThemeConfig) {
    setTheme(t)
    setCustom({ ...t, id: "custom", name: "Custom" })
  }

  function updateCustom(patch: Partial<ThemeConfig>) {
    const updated: ThemeConfig = { ...custom, ...patch, id: "custom", name: "Custom" }
    setCustom(updated)
    setTheme(updated)
  }

  function updatePaletteColor(index: number, color: string) {
    const palette = [...custom.chartPalette]
    palette[index] = color
    updateCustom({ chartPalette: palette })
  }

  const isPresetActive = (t: ThemeConfig) => currentTheme.id === t.id
  const isCustomActive  = currentTheme.id === "custom"

  return (
    <div className="tp-panel">

      <div className="tp-tabs">
        <button
          className={subTab === "theme"  ? "active" : ""}
          onClick={() => setSubTab("theme")}
        >
          Theme
        </button>
        <button
          className={subTab === "layout" ? "active" : ""}
          onClick={() => setSubTab("layout")}
        >
          Layout
        </button>
      </div>

      <div className="tp-body">

        {subTab === "theme" && (
          <>
            <div className="tp-section-label">Presets</div>

            <div className="tp-preset-grid">
              {PRESET_THEMES.map(t => (
                <button
                  key={t.id}
                  className={`tp-preset-card${isPresetActive(t) ? " active" : ""}`}
                  onClick={() => applyPreset(t)}
                  title={t.name}
                >
                  <div className="tp-preview">
                    <ThemePreview theme={t} />
                  </div>
                  <div className="tp-preset-name">{t.name}</div>
                  {isPresetActive(t) && <span className="tp-preset-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="tp-divider" />

            <div className="tp-section-label">
              Customize
              {isCustomActive && <span className="tp-custom-badge">Active</span>}
            </div>

            <div className="tp-custom-rows">

              <div className="tp-row">
                <label>Accent</label>
                <input
                  type="color" value={custom.accentColor}
                  onChange={e => updateCustom({ accentColor: e.target.value })}
                  title="Accent / highlight colour"
                />
              </div>

              <div className="tp-row">
                <label>Widget Bg</label>
                <input
                  type="color" value={custom.widgetBg}
                  onChange={e => updateCustom({ widgetBg: e.target.value })}
                  title="Widget card background"
                />
              </div>

              <div className="tp-row">
                <label>Widget Border</label>
                <input
                  type="color" value={custom.widgetBorder}
                  onChange={e => updateCustom({ widgetBorder: e.target.value })}
                  title="Widget card border colour"
                />
              </div>

              <div className="tp-row">
                <label>
                  Radius
                  <span className="tp-val">{custom.widgetRadius}px</span>
                </label>
                <input
                  type="range" min={0} max={20} value={custom.widgetRadius}
                  onChange={e => updateCustom({ widgetRadius: Number(e.target.value) })}
                  title="Widget corner radius"
                />
              </div>

              <div className="tp-row">
                <label>Text</label>
                <input
                  type="color" value={custom.textColor}
                  onChange={e => updateCustom({ textColor: e.target.value })}
                  title="Primary text colour"
                />
              </div>

              <div className="tp-row">
                <label>Secondary</label>
                <input
                  type="color" value={custom.textSecondary}
                  onChange={e => updateCustom({ textSecondary: e.target.value })}
                  title="Secondary text colour"
                />
              </div>

              <div className="tp-row">
                <label>Font</label>
                <select
                  value={custom.fontFamily}
                  onChange={e => updateCustom({ fontFamily: e.target.value })}
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="tp-row">
                <label>Chart Palette</label>
                <div className="tp-palette">
                  {custom.chartPalette.map((c, i) => (
                    <input
                      key={i}
                      type="color" value={c}
                      onChange={e => updatePaletteColor(i, e.target.value)}
                      title={`Chart colour ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

            </div>

            <button className="tp-reset-btn" onClick={() => applyPreset(DEFAULT_THEME)}>
              Reset to Default
            </button>
          </>
        )}

        {subTab === "layout" && (
          <>
            <div className="tp-section-label">Canvas Size</div>

            <div className="tp-custom-rows">
              <div className="tp-row">
                <label>Width (px)</label>
                <input
                  type="number" className="tp-num" min={400} max={3840}
                  value={dashboard.canvas.width}
                  onChange={e => updateCanvas({ width: Math.max(400, Number(e.target.value)) })}
                />
              </div>
              <div className="tp-row">
                <label>Height (px)</label>
                <input
                  type="number" className="tp-num" min={300} max={2160}
                  value={dashboard.canvas.height}
                  onChange={e => updateCanvas({ height: Math.max(300, Number(e.target.value)) })}
                />
              </div>
            </div>

            <div className="tp-divider" />
            <div className="tp-section-label">Quick Sizes</div>

            <div className="tp-size-presets">
              {SIZE_PRESETS.map(s => (
                <button
                  key={s.label}
                  className="tp-size-btn"
                  onClick={() => updateCanvas({ width: s.w, height: s.h })}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="tp-divider" />
            <div className="tp-section-label">Background</div>

            <div className="tp-custom-rows">
              <div className="tp-row">
                <label>Canvas Color</label>
                <input
                  type="color"
                  value={dashboard.background?.color || "#f4f6f9"}
                  onChange={e => setCanvasBg({ color: e.target.value })}
                  title="Dashboard canvas background colour"
                />
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
