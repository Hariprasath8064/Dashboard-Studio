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

const PER_BAR_TYPES  = ["bar","stacked-bar","donut","pie","timeline","radar"]
const LEGEND_TYPES   = ["bar","line","area","stacked-bar","scatter","radar","donut","pie","timeline"]
const AXIS_TYPES     = ["bar","line","area","stacked-bar","scatter","timeline"]
const DATA_LABEL_TYPES = ["bar","stacked-bar","area"]
const DUAL_BAR_TYPES = ["bar","stacked-bar"]

export default function StylePanel({ widget }: any) {

  const updateWidget = useDashboardStore(s => s.updateWidget)
  const dataset = useDashboardStore(s => s.dashboard.dataset)
  const [perBarOpen,   setPerBarOpen]   = useState(false)
  const [y2BarOpen,    setY2BarOpen]    = useState(false)
  const [axisOpen,     setAxisOpen]     = useState(false)

  const isPerBarType   = PER_BAR_TYPES.includes(widget.type)
  const hasLegend      = LEGEND_TYPES.includes(widget.type)
  const hasAxisConfig  = AXIS_TYPES.includes(widget.type)
  const hasDataLabels  = DATA_LABEL_TYPES.includes(widget.type)
  const hasDualBar     = DUAL_BAR_TYPES.includes(widget.type) && !!widget.y2Column

  // Get bar labels from dataset
  let barLabels: string[] = []
  if (isPerBarType && dataset && widget.query?.xColumn && widget.query?.yColumn) {
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

  const y2Base = widget.y2Color || '#16a34a'
  const y2BarColors: string[] = widget.y2BarColors && widget.y2BarColors.length > 0
    ? widget.y2BarColors
    : barLabels.map((_, i) => BAR_PALETTE[(i + 2) % BAR_PALETTE.length])

  function updateColor(color: string) {
    updateWidget({ ...widget, color, barColors: [] })
  }

  function updateBarColor(i: number, color: string) {
    const next = [...barColors]
    while (next.length < barLabels.length) next.push(BAR_PALETTE[next.length % BAR_PALETTE.length])
    next[i] = color
    updateWidget({ ...widget, barColors: next })
  }

  function updateY2BarColor(i: number, color: string) {
    const next = [...y2BarColors]
    while (next.length < barLabels.length) next.push(BAR_PALETTE[(next.length + 2) % BAR_PALETTE.length])
    next[i] = color
    updateWidget({ ...widget, y2BarColors: next })
  }

  function applyToAll(color: string) {
    updateWidget({ ...widget, color, barColors: [] })
  }

  function set(field: string, value: any) {
    updateWidget({ ...widget, [field]: value })
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
          <div key={c} className={`pp-swatch${currentColor === c ? ' sel' : ''}`}
            style={{ background: c }} onClick={() => updateColor(c)} title={c} />
        ))}
      </div>

      <div className="pp-row" style={{ marginTop: 8 }}>
        <span className="pp-label">Custom</span>
        <input type="color" value={currentColor}
          style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', padding: 2 }}
          onChange={(e) => updateColor(e.target.value)} />
        <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1 }}>{currentColor}</span>
      </div>

      {/* Legend toggle */}
      {hasLegend && (
        <div className="pp-row">
          <span className="pp-label">Legend</span>
          <div className="pp-toggle">
            <button className={`pp-toggle-btn${widget.showLegend !== false ? ' on' : ''}`} onClick={() => set("showLegend", true)}>On</button>
            <button className={`pp-toggle-btn${widget.showLegend === false ? ' on' : ''}`} onClick={() => set("showLegend", false)}>Off</button>
          </div>
        </div>
      )}

      {/* Data labels toggle */}
      {hasDataLabels && (
        <div className="pp-row">
          <span className="pp-label">Data Labels</span>
          <div className="pp-toggle">
            <button className={`pp-toggle-btn${widget.showDataLabels ? ' on' : ''}`} onClick={() => set("showDataLabels", true)}>On</button>
            <button className={`pp-toggle-btn${!widget.showDataLabels ? ' on' : ''}`} onClick={() => set("showDataLabels", false)}>Off</button>
          </div>
        </div>
      )}

      {/* Axis customization */}
      {hasAxisConfig && (
        <div className="pp-bar-colors" style={{ marginTop: 6 }}>
          <button className="pp-bar-colors-toggle" onClick={() => setAxisOpen(o => !o)}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              style={{ transform: axisOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
              <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Axis Options
          </button>

          {axisOpen && (
            <div className="pp-bar-list" style={{ gap: 6 }}>
              <div className="pp-row" style={{ margin: 0 }}>
                <span className="pp-label">X Label</span>
                <input className="pp-input" placeholder="X axis label"
                  value={widget.xAxisLabel || ""}
                  onChange={(e) => set("xAxisLabel", e.target.value || undefined)} />
              </div>
              <div className="pp-row" style={{ margin: 0 }}>
                <span className="pp-label">Y Label</span>
                <input className="pp-input" placeholder="Y axis label"
                  value={widget.yAxisLabel || ""}
                  onChange={(e) => set("yAxisLabel", e.target.value || undefined)} />
              </div>
              <div className="pp-row" style={{ margin: 0 }}>
                <span className="pp-label">Font Size</span>
                <input className="pp-input" type="number" min={8} max={20}
                  value={widget.axisFontSize || 11}
                  onChange={(e) => set("axisFontSize", Number(e.target.value))} />
              </div>
              <div className="pp-row" style={{ margin: 0 }}>
                <span className="pp-label">X Rotation</span>
                <input className="pp-input" type="number" min={-90} max={90} step={15}
                  placeholder="0"
                  value={widget.xTickRotation ?? ""}
                  onChange={(e) => set("xTickRotation", e.target.value !== "" ? Number(e.target.value) : undefined)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Per-bar colors — 1st dataset */}
      {isPerBarType && barLabels.length > 0 && (
        <div className="pp-bar-colors">
          <button className="pp-bar-colors-toggle" onClick={() => setPerBarOpen(o => !o)}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              style={{ transform: perBarOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
              <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Per-bar Colors
            <span className="pp-bar-colors-count">{barLabels.length}</span>
          </button>

          {perBarOpen && (
            <div className="pp-bar-list">
              <button className="pp-apply-all-btn" onClick={() => applyToAll(currentColor)}
                title="Reset all bars to the global color above">
                Apply global color to all
              </button>
              {barLabels.map((label, i) => (
                <div key={i} className="pp-bar-row">
                  <div className="pp-bar-swatch" style={{ background: barColors[i] || BAR_PALETTE[i % BAR_PALETTE.length] }} />
                  <span className="pp-bar-label" title={label}>{label}</span>
                  <input type="color" value={barColors[i] || BAR_PALETTE[i % BAR_PALETTE.length]}
                    style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: 1, flexShrink: 0 }}
                    onChange={(e) => updateBarColor(i, e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-bar colors — 2nd Y dataset (bar / stacked-bar only) */}
      {hasDualBar && barLabels.length > 0 && (
        <div className="pp-bar-colors">
          <button className="pp-bar-colors-toggle" onClick={() => setY2BarOpen(o => !o)}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              style={{ transform: y2BarOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
              <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            2nd Series Colors
            <span className="pp-bar-colors-count">{barLabels.length}</span>
          </button>

          {y2BarOpen && (
            <div className="pp-bar-list">
              <button className="pp-apply-all-btn"
                onClick={() => updateWidget({ ...widget, y2Color: y2Base, y2BarColors: [] })}
                title="Reset 2nd series to the Y2 color above">
                Apply Y2 color to all
              </button>
              {barLabels.map((label, i) => (
                <div key={i} className="pp-bar-row">
                  <div className="pp-bar-swatch" style={{ background: y2BarColors[i] || BAR_PALETTE[(i + 2) % BAR_PALETTE.length] }} />
                  <span className="pp-bar-label" title={label}>{label}</span>
                  <input type="color" value={y2BarColors[i] || BAR_PALETTE[(i + 2) % BAR_PALETTE.length]}
                    style={{ width: 24, height: 24, border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: 1, flexShrink: 0 }}
                    onChange={(e) => updateY2BarColor(i, e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )

}
