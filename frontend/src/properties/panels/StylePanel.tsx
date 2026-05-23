import { useState } from "react"
import { useDashboardStore } from "../../store/dashboardStore"
import { useWidgetDataset } from "../../hooks/useWidgetDataset"
import { runAggregation } from "../../dataset/QueryEngine"
import AxisOptionsEditor  from "./style/AxisOptionsEditor"
import PerBarColorEditor  from "./style/PerBarColorEditor"

const PALETTE = [
  '#005EB8','#16a34a','#dc2626','#d97706',
  '#7c3aed','#0891b2','#ea580c','#64748b'
]

const PER_BAR_TYPES    = ["bar","stacked-bar","donut","pie","timeline","radar"]
const LEGEND_TYPES     = ["bar","line","area","stacked-bar","scatter","radar","donut","pie","timeline"]
const AXIS_TYPES       = ["bar","line","area","stacked-bar","scatter","timeline"]
const DATA_LABEL_TYPES = ["bar","stacked-bar","area"]
const DUAL_BAR_TYPES   = ["bar","stacked-bar"]
const DUAL_Y_TYPES     = ["bar","line","area","stacked-bar"]

export default function StylePanel({ widget }: any) {

  const updateWidget = useDashboardStore(s => s.updateWidget)
  const dataset      = useWidgetDataset(widget)
  const [axisOpen,   setAxisOpen] = useState(false)

  const isPerBarType  = PER_BAR_TYPES.includes(widget.type)
  const hasLegend     = LEGEND_TYPES.includes(widget.type)
  const hasAxisConfig = AXIS_TYPES.includes(widget.type)
  const hasDataLabels = DATA_LABEL_TYPES.includes(widget.type)
  const hasDualBar    = DUAL_BAR_TYPES.includes(widget.type) && !!widget.y2Column

  let barLabels: string[] = []
  if (isPerBarType && dataset && widget.query?.xColumn && widget.query?.yColumn) {
    try {
      barLabels = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation || "SUM").labels
    } catch { /* empty dataset */ }
  }

  const currentColor = widget.color || '#005EB8'

  function updateColor(color: string) {
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
          <div key={c} className={`pp-swatch${currentColor === c ? " sel" : ""}`}
            style={{ background: c }} onClick={() => updateColor(c)} title={c} />
        ))}
      </div>
      <div className="pp-row" style={{ marginTop: 8 }}>
        <span className="pp-label">Custom</span>
        <input type="color" value={currentColor}
          style={{ width: 28, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", padding: 2 }}
          onChange={e => updateColor(e.target.value)} />
        <span style={{ fontSize: 11, color: "var(--text3)", flex: 1 }}>{currentColor}</span>
      </div>

      {/* 2nd series color (dual Y-axis types) */}
      {DUAL_Y_TYPES.includes(widget.type) && widget.y2Column && (
        <div className="pp-row" style={{ marginTop: 6 }}>
          <span className="pp-label">2nd Color</span>
          <input type="color" value={widget.y2Color || "#16a34a"}
            style={{ width: 28, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", padding: 2 }}
            onChange={e => set("y2Color", e.target.value)} />
          <span style={{ fontSize: 11, color: "var(--text3)", flex: 1 }}>{widget.y2Color || "#16a34a"}</span>
        </div>
      )}

      {/* Legend */}
      {hasLegend && (
        <div className="pp-row">
          <span className="pp-label">Legend</span>
          <div className="pp-toggle">
            <button className={`pp-toggle-btn${widget.showLegend !== false ? " on" : ""}`} onClick={() => set("showLegend", true)}>On</button>
            <button className={`pp-toggle-btn${widget.showLegend === false ? " on" : ""}`} onClick={() => set("showLegend", false)}>Off</button>
          </div>
        </div>
      )}

      {/* Data labels */}
      {hasDataLabels && (
        <div className="pp-row">
          <span className="pp-label">Data Labels</span>
          <div className="pp-toggle">
            <button className={`pp-toggle-btn${widget.showDataLabels ? " on" : ""}`} onClick={() => set("showDataLabels", true)}>On</button>
            <button className={`pp-toggle-btn${!widget.showDataLabels ? " on" : ""}`} onClick={() => set("showDataLabels", false)}>Off</button>
          </div>
        </div>
      )}

      {/* Axis options */}
      {hasAxisConfig && (
        <div className="pp-bar-colors" style={{ marginTop: 6 }}>
          <button className="pp-bar-colors-toggle" onClick={() => setAxisOpen(o => !o)}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              style={{ transform: axisOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
              <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Axis Options
          </button>
          {axisOpen && <AxisOptionsEditor widget={widget} onSet={set} />}
        </div>
      )}

      {/* Per-bar / per-slice colors */}
      {isPerBarType && (
        <PerBarColorEditor
          widget={widget}
          barLabels={barLabels}
          hasDualBar={hasDualBar}
          currentColor={currentColor}
          onUpdateWidget={updateWidget}
        />
      )}

    </div>
  )
}
