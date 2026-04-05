// Sub-panel: theme picker for TableProperties

const THEMES = [
  { key: "default",  label: "Default",  hBg: "#f4f6f9", hFg: "#374151", stripe: null       },
  { key: "striped",  label: "Striped",  hBg: "#f4f6f9", hFg: "#374151", stripe: "#f0f4fa"  },
  { key: "bordered", label: "Bordered", hBg: "#f4f6f9", hFg: "#374151", stripe: null       },
  { key: "minimal",  label: "Minimal",  hBg: null,       hFg: "#1b1f24", stripe: null       },
  { key: "dark",     label: "Dark",     hBg: "#1b2230",  hFg: "#ffffff", stripe: "#f8f9fb" },
  { key: "blue",     label: "Blue",     hBg: "#2b7cff",  hFg: "#ffffff", stripe: "#eff5ff" },
  { key: "green",    label: "Green",    hBg: "#059669",  hFg: "#ffffff", stripe: "#f0fdf7" },
  { key: "rose",     label: "Rose",     hBg: "#e11d48",  hFg: "#ffffff", stripe: "#fff1f4" },
]

interface Props {
  theme: string
  onThemeChange: (key: string) => void
}

export default function ThemePanel({ theme, onThemeChange }: Props) {
  return (
    <div className="theme-cards">
      {THEMES.map(t => (
        <div
          key={t.key}
          className={`theme-card${theme === t.key ? " active" : ""}`}
          onClick={() => onThemeChange(t.key)}
        >
          <div className="theme-preview">
            <div
              className="theme-prev-header"
              style={{ background: t.hBg || "#f4f6f9" }}
            >
              <div style={{
                background: t.hFg, opacity: .75,
                height: 4, width: "72%", borderRadius: 2,
              }} />
            </div>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="theme-prev-row"
                style={{ background: i % 2 === 1 && t.stripe ? t.stripe : "transparent" }}
              >
                <span style={{
                  background: "#bcc5d0", height: 3,
                  width: ["65%", "80%", "55%"][i],
                  borderRadius: 2, display: "block",
                }} />
              </div>
            ))}
          </div>
          <div className="theme-label">{t.label}</div>
        </div>
      ))}
    </div>
  )
}
