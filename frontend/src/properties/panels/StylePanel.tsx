import { useState } from "react"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"

const PALETTE = [
  '#005EB8','#16a34a','#dc2626','#d97706',
  '#7c3aed','#0891b2','#ea580c','#64748b'
]

const BAR_PALETTE = [
  '#2b7cff','#16a34a','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#64748b',
  '#ec4899','#84cc16','#14b8a6','#6366f1'
]

export default function StylePanel({ widget }: any) {

  const updateWidget = useDashboardStore(s => s.updateWidget)
  const dataset = useDashboardStore(s => s.dashboard.dataset)
  const [perBarOpen, setPerBarOpen] = useState(false)

  const isBarOrDonut = widget.type === "bar" || widget.type === "donut" || widget.type === "pie" || widget.type === "timeline"
  const isChartWithLegend = ["bar","line","donut","pie","timeline"].includes(widget.type)

  // Get bar labels from dataset if chart has columns set
  let barLabels: string[] = []
  if (isBarOrDonut && dataset && widget.query?.xColumn && widget.query?.yColumn) {
    try {
      const result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation || "SUM")
      barLabels = result.labels
    } catch {
      barLabels = []
    }
  }

  const currentColor = widget.color || '#005EB8'
  const barColors: string[] = widget.barColors && widget.barColors.length > 0
    ? widget.barColors
    : barLabels.map((_, i) => BAR_PALETTE[i % BAR_PALETTE.length])

  function updateColor(color: string) {
    updateWidget({ ...widget, color, barColors: [] })
  }

  function updateBarColor(i: number, color: string) {
    const next = [...barColors]
    // Pad if needed
    while (next.length < barLabels.length) next.push(BAR_PALETTE[next.length % BAR_PALETTE.length])
    next[i] = color
    updateWidget({ ...widget, barColors: next })
  }

  function applyToAll(color: string) {
    updateWidget({ ...widget, color, barColors: [] })
  }

  return (

    <div className="pp-section">

      <div className="pp-section-title">Style</div>

      {/* Global color */}
      <div className="pp-row">
        <span className="pp-label">Color</span>
      </div>

      <div className="pp-color-swatches">
        {PALETTE.map(c => (
          <div
            key={c}
            className={`pp-swatch${currentColor === c ? ' sel' : ''}`}
            style={{ background: c }}
            onClick={() => updateColor(c)}
            title={c}
          />
        ))}
      </div>

      <div className="pp-row" style={{ marginTop: 8 }}>
        <span className="pp-label">Custom</span>
        <input
          type="color"
          value={currentColor}
          style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: 2 }}
          onChange={(e) => updateColor(e.target.value)}
        />
        <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1 }}>{currentColor}</span>
      </div>

      {/* Legend toggle — chart types only */}
      {isChartWithLegend && (
      <div className="pp-row">
        <span className="pp-label">Legend</span>
        <div className="pp-toggle">
          <button className={`pp-toggle-btn${widget.showLegend !== false ? ' on' : ''}`} onClick={() => updateWidget({ ...widget, showLegend: true })}>On</button>
          <button className={`pp-toggle-btn${widget.showLegend === false ? ' on' : ''}`} onClick={() => updateWidget({ ...widget, showLegend: false })}>Off</button>
        </div>
      </div>
      )}

      {/* Per-bar colors — only for bar/donut with data */}
      {isBarOrDonut && barLabels.length > 0 && (

        <div className="pp-bar-colors">

          <button
            className="pp-bar-colors-toggle"
            onClick={() => setPerBarOpen(o => !o)}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: perBarOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
              <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Per-bar Colors
            <span className="pp-bar-colors-count">{barLabels.length}</span>
          </button>

          {perBarOpen && (

            <div className="pp-bar-list">

              <button
                className="pp-apply-all-btn"
                onClick={() => applyToAll(currentColor)}
                title="Reset all bars to the global color above"
              >
                Apply global color to all
              </button>

              {barLabels.map((label, i) => (
                <div key={i} className="pp-bar-row">
                  <div
                    className="pp-bar-swatch"
                    style={{ background: barColors[i] || BAR_PALETTE[i % BAR_PALETTE.length] }}
                  />
                  <span className="pp-bar-label" title={label}>{label}</span>
                  <input
                    type="color"
                    value={barColors[i] || BAR_PALETTE[i % BAR_PALETTE.length]}
                    style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: 1, flexShrink: 0 }}
                    onChange={(e) => updateBarColor(i, e.target.value)}
                  />
                </div>
              ))}

            </div>

          )}

        </div>

      )}

    </div>

  )

}