import { useDashboardStore } from "../store/dashboardStore"
import type { TextWidget } from "../types/widgetTypes"

const FONTS = [
  { label: "Default",     value: "inherit" },
  { label: "Inter",       value: "'Inter', sans-serif" },
  { label: "Georgia",     value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Arial",       value: "Arial, sans-serif" },
  { label: "Trebuchet",   value: "'Trebuchet MS', sans-serif" },
]

function AlignBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      className={`txt-fmt-btn${active ? " on" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

interface Props { widget: TextWidget }

export default function TextProperties({ widget }: Props) {

  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const upd = (patch: Partial<TextWidget>) => updateWidget({ ...widget, ...patch })

  return (
    <div className="pp-section">

      {/* ── Heading ── */}
      <div className="pp-section-title">Heading</div>

      <div className="pp-field">
        <label>Text</label>
        <input
          className="pp-input"
          value={widget.heading}
          onChange={(e) => upd({ heading: e.target.value })}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Font</span>
        <select
          className="pp-select"
          value={widget.headingFont || "inherit"}
          onChange={(e) => upd({ headingFont: e.target.value })}
        >
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <div className="pp-row">
        <span className="pp-label">Size</span>
        <input
          className="pp-input"
          type="number"
          min={8} max={96} step={1}
          value={widget.headingSize ?? 18}
          onChange={(e) => upd({ headingSize: Number(e.target.value) })}
          style={{ width: 64 }}
        />
        <span className="pp-label" style={{ marginLeft: 8 }}>Color</span>
        <input
          type="color"
          value={widget.headingColor || "#1e293b"}
          onChange={(e) => upd({ headingColor: e.target.value })}
          style={{ width: 28, height: 28, padding: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer" }}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Style</span>
        <div className="txt-fmt-group">
          <AlignBtn active={!!widget.headingBold}   onClick={() => upd({ headingBold:   !widget.headingBold })}   title="Bold"><b>B</b></AlignBtn>
          <AlignBtn active={!!widget.headingItalic} onClick={() => upd({ headingItalic: !widget.headingItalic })} title="Italic"><i>I</i></AlignBtn>
        </div>
        <div className="txt-fmt-group" style={{ marginLeft: 6 }}>
          <AlignBtn active={(widget.headingAlign || "left") === "left"}   onClick={() => upd({ headingAlign: "left" })}   title="Left">
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 3h11M1 6h7M1 9h9M1 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </AlignBtn>
          <AlignBtn active={widget.headingAlign === "center"} onClick={() => upd({ headingAlign: "center" })} title="Center">
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 3h11M3 6h7M2 9h9M4 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </AlignBtn>
          <AlignBtn active={widget.headingAlign === "right"}  onClick={() => upd({ headingAlign: "right" })}  title="Right">
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 3h11M5 6h7M3 9h9M7 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </AlignBtn>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="pp-section-title" style={{ marginTop: 14 }}>Body</div>

      <div className="pp-field">
        <label>Text</label>
        <textarea
          className="pp-input"
          rows={3}
          value={widget.body}
          onChange={(e) => upd({ body: e.target.value })}
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Font</span>
        <select
          className="pp-select"
          value={widget.bodyFont || "inherit"}
          onChange={(e) => upd({ bodyFont: e.target.value })}
        >
          {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      <div className="pp-row">
        <span className="pp-label">Size</span>
        <input
          className="pp-input"
          type="number"
          min={8} max={72} step={1}
          value={widget.bodySize ?? 13}
          onChange={(e) => upd({ bodySize: Number(e.target.value) })}
          style={{ width: 64 }}
        />
        <span className="pp-label" style={{ marginLeft: 8 }}>Color</span>
        <input
          type="color"
          value={widget.bodyColor || "#64748b"}
          onChange={(e) => upd({ bodyColor: e.target.value })}
          style={{ width: 28, height: 28, padding: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer" }}
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">Style</span>
        <div className="txt-fmt-group">
          <AlignBtn active={!!widget.bodyBold}      onClick={() => upd({ bodyBold:      !widget.bodyBold })}      title="Bold"><b>B</b></AlignBtn>
          <AlignBtn active={!!widget.bodyItalic}    onClick={() => upd({ bodyItalic:    !widget.bodyItalic })}    title="Italic"><i>I</i></AlignBtn>
          <AlignBtn active={!!widget.bodyUnderline} onClick={() => upd({ bodyUnderline: !widget.bodyUnderline })} title="Underline"><u>U</u></AlignBtn>
        </div>
        <div className="txt-fmt-group" style={{ marginLeft: 6 }}>
          <AlignBtn active={(widget.bodyAlign || "left") === "left"}   onClick={() => upd({ bodyAlign: "left" })}   title="Left">
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 3h11M1 6h7M1 9h9M1 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </AlignBtn>
          <AlignBtn active={widget.bodyAlign === "center"} onClick={() => upd({ bodyAlign: "center" })} title="Center">
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 3h11M3 6h7M2 9h9M4 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </AlignBtn>
          <AlignBtn active={widget.bodyAlign === "right"}  onClick={() => upd({ bodyAlign: "right" })}  title="Right">
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 3h11M5 6h7M3 9h9M7 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </AlignBtn>
        </div>
      </div>

    </div>
  )

}
