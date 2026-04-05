// Sub-component: per-bar color editors (1st and 2nd series) for StylePanel

import { useState } from "react"

const BAR_PALETTE = [
  '#2b7cff','#16a34a','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#64748b',
  '#ec4899','#84cc16','#14b8a6','#6366f1'
]

interface Props {
  widget: any
  barLabels: string[]
  hasDualBar: boolean
  currentColor: string
  onUpdateWidget: (patch: any) => void
}

export default function PerBarColorEditor({
  widget, barLabels, hasDualBar, currentColor, onUpdateWidget
}: Props) {
  const [perBarOpen, setPerBarOpen] = useState(false)
  const [y2BarOpen,  setY2BarOpen]  = useState(false)

  const barColors: string[] = widget.barColors && widget.barColors.length > 0
    ? widget.barColors
    : barLabels.map((_, i) => BAR_PALETTE[i % BAR_PALETTE.length])

  const y2BarColors: string[] = widget.y2BarColors && widget.y2BarColors.length > 0
    ? widget.y2BarColors
    : barLabels.map((_, i) => BAR_PALETTE[(i + 2) % BAR_PALETTE.length])

  function updateBarColor(i: number, color: string) {
    const next = [...barColors]
    while (next.length < barLabels.length) next.push(BAR_PALETTE[next.length % BAR_PALETTE.length])
    next[i] = color
    onUpdateWidget({ ...widget, barColors: next })
  }

  function updateY2BarColor(i: number, color: string) {
    const next = [...y2BarColors]
    while (next.length < barLabels.length) next.push(BAR_PALETTE[(next.length + 2) % BAR_PALETTE.length])
    next[i] = color
    onUpdateWidget({ ...widget, y2BarColors: next })
  }

  const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
      style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
      <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <>
      {/* Per-bar colors — 1st dataset */}
      {barLabels.length > 0 && (
        <div className="pp-bar-colors">
          <button className="pp-bar-colors-toggle" onClick={() => setPerBarOpen(o => !o)}>
            <ChevronIcon open={perBarOpen} />
            Per-bar Colors
            <span className="pp-bar-colors-count">{barLabels.length}</span>
          </button>
          {perBarOpen && (
            <div className="pp-bar-list">
              <button className="pp-apply-all-btn"
                title="Reset all bars to the global color above"
                onClick={() => onUpdateWidget({ ...widget, color: currentColor, barColors: [] })}>
                Apply global color to all
              </button>
              {barLabels.map((label, i) => (
                <div key={i} className="pp-bar-row">
                  <div className="pp-bar-swatch" style={{ background: barColors[i] || BAR_PALETTE[i % BAR_PALETTE.length] }} />
                  <span className="pp-bar-label" title={label}>{label}</span>
                  <input type="color" value={barColors[i] || BAR_PALETTE[i % BAR_PALETTE.length]}
                    style={{ width: 24, height: 24, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", padding: 1, flexShrink: 0 }}
                    onChange={e => updateBarColor(i, e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-bar colors — 2nd Y dataset */}
      {hasDualBar && barLabels.length > 0 && (
        <div className="pp-bar-colors">
          <button className="pp-bar-colors-toggle" onClick={() => setY2BarOpen(o => !o)}>
            <ChevronIcon open={y2BarOpen} />
            2nd Series Colors
            <span className="pp-bar-colors-count">{barLabels.length}</span>
          </button>
          {y2BarOpen && (
            <div className="pp-bar-list">
              <button className="pp-apply-all-btn"
                title="Reset 2nd series to the Y2 color above"
                onClick={() => onUpdateWidget({ ...widget, y2Color: widget.y2Color || "#16a34a", y2BarColors: [] })}>
                Apply Y2 color to all
              </button>
              {barLabels.map((label, i) => (
                <div key={i} className="pp-bar-row">
                  <div className="pp-bar-swatch" style={{ background: y2BarColors[i] || BAR_PALETTE[(i + 2) % BAR_PALETTE.length] }} />
                  <span className="pp-bar-label" title={label}>{label}</span>
                  <input type="color" value={y2BarColors[i] || BAR_PALETTE[(i + 2) % BAR_PALETTE.length]}
                    style={{ width: 24, height: 24, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", padding: 1, flexShrink: 0 }}
                    onChange={e => updateY2BarColor(i, e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
