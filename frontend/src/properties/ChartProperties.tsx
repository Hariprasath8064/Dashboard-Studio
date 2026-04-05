import { useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import type { ChartWidget, ColorRule } from "../types/widgetTypes"
import { runAggregation } from "../dataset/QueryEngine"
import { chartColors } from "../constants/chartColors"

interface Props {
  widget: ChartWidget
}

const CHART_TYPES_WITH_DUAL_Y = ["bar", "line", "area", "stacked-bar"]
const CHART_TYPES_WITH_FILTER = ["bar", "line", "area", "stacked-bar", "radar", "timeline"]
const RULE_OPS = [
  { value: "gt",  label: ">"  },
  { value: "gte", label: ">=" },
  { value: "lt",  label: "<"  },
  { value: "lte", label: "<=" },
  { value: "eq",  label: "="  },
]

export default function ChartProperties({ widget }: Props) {

  const dataset      = useDashboardStore((s) => s.dashboard.dataset)
  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const [rulesOpen, setRulesOpen] = useState(false)

  if (!dataset) {
    return <div className="pp-section">Upload a dataset first</div>
  }

  function update(field: string, value: any) {
    updateWidget({ ...widget, query: { ...widget.query, [field]: value } })
  }

  function set(field: string, value: any) {
    updateWidget({ ...widget, [field]: value })
  }

  // Slice value preview for donut/pie
  let donutSlices: { label: string; value: number; color: string }[] = []
  if ((widget.type === "donut" || widget.type === "pie") && widget.query.xColumn && widget.query.yColumn) {
    try {
      const result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation || "SUM")
      donutSlices = result.labels.map((label, i) => ({
        label,
        value: result.values[i],
        color: (Array.isArray(widget.barColors) && widget.barColors[i]) || chartColors[i % chartColors.length]
      }))
    } catch { donutSlices = [] }
  }

  const rules: ColorRule[] = widget.colorRules || []

  function addRule() {
    set("colorRules", [...rules, { op: "gt", value: 0, color: "#ef4444" }])
  }

  function removeRule(i: number) {
    set("colorRules", rules.filter((_, idx) => idx !== i))
  }

  function updateRule(i: number, patch: Partial<ColorRule>) {
    const next = rules.map((r, idx) => idx === i ? { ...r, ...patch } : r)
    set("colorRules", next)
  }

  const showDualY  = CHART_TYPES_WITH_DUAL_Y.includes(widget.type)
  const showFilter = CHART_TYPES_WITH_FILTER.includes(widget.type)
  const isScatterLike = widget.type === "scatter"

  return (
    <div className="pp-section">

      {/* ── Basic config ── */}
      <div className="pp-section-title">Chart Config</div>

      <div className="pp-row">
        <span className="pp-label">Title</span>
        <input className="pp-input" value={widget.title}
          onChange={(e) => updateWidget({ ...widget, title: e.target.value })} />
      </div>

      <div className="pp-row">
        <span className="pp-label">{isScatterLike ? "X Column" : "X Axis"}</span>
        <select className="pp-select" value={widget.query.xColumn || ""} onChange={(e) => update("xColumn", e.target.value)}>
          <option value="">Select column</option>
          {(isScatterLike ? dataset.columns.filter(c => c.type === "number") : dataset.columns)
            .map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div className="pp-row">
        <span className="pp-label">{isScatterLike ? "Y Column" : "Y Axis"}</span>
        <select className="pp-select" value={widget.query.yColumn || ""} onChange={(e) => update("yColumn", e.target.value)}>
          <option value="">Select column</option>
          {(isScatterLike ? dataset.columns.filter(c => c.type === "number") : dataset.columns)
            .map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {!isScatterLike && (
        <div className="pp-row">
          <span className="pp-label">Aggregation</span>
          <select className="pp-select" value={widget.query.aggregation} onChange={(e) => update("aggregation", e.target.value)}>
            <option value="SUM">SUM</option>
            <option value="AVG">AVG</option>
            <option value="COUNT">COUNT</option>
            <option value="MIN">MIN</option>
            <option value="MAX">MAX</option>
          </select>
        </div>
      )}

      {/* ── Dual Y-axis ── */}
      {showDualY && (
        <>
          <div className="pp-section-title" style={{ marginTop: 14 }}>Dual Y-Axis</div>

          <div className="pp-row">
            <span className="pp-label">2nd Y Column</span>
            <select className="pp-select" value={widget.y2Column || ""}
              onChange={(e) => set("y2Column", e.target.value || undefined)}>
              <option value="">None</option>
              {dataset.columns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {widget.y2Column && (
            <>
              <div className="pp-row">
                <span className="pp-label">2nd Aggregation</span>
                <select className="pp-select" value={widget.y2Aggregation || widget.query.aggregation}
                  onChange={(e) => set("y2Aggregation", e.target.value)}>
                  <option value="SUM">SUM</option>
                  <option value="AVG">AVG</option>
                  <option value="COUNT">COUNT</option>
                  <option value="MIN">MIN</option>
                  <option value="MAX">MAX</option>
                </select>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Filter / Top-N ── */}
      {showFilter && (
        <>
          <div className="pp-section-title" style={{ marginTop: 14 }}>Filter</div>
          <div className="pp-row">
            <span className="pp-label">Top N</span>
            <input className="pp-input" type="number" min={1} max={500} placeholder="All"
              value={widget.filterTopN || ""}
              onChange={(e) => set("filterTopN", e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </>
      )}

      {/* ── Conditional color rules ── */}
      {(widget.type === "bar" || widget.type === "stacked-bar") && (
        <>
          <div className="pp-section-title" style={{ marginTop: 14 }}>
            <button className="pp-bar-colors-toggle" onClick={() => setRulesOpen(o => !o)} style={{ width: "100%" }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
                style={{ transform: rulesOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
                <path d="M3 2l4 3.5L3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Conditional Colors
              {rules.length > 0 && <span className="pp-bar-colors-count">{rules.length}</span>}
            </button>
          </div>

          {rulesOpen && (
            <div className="pp-cond-rules">
              {rules.map((rule, i) => (
                <div key={i} className="pp-cond-row">
                  <span style={{ fontSize: 11, color: "var(--text3)", minWidth: 28 }}>if val</span>
                  <select className="pp-select" style={{ flex: 1, minWidth: 0 }} value={rule.op}
                    onChange={(e) => updateRule(i, { op: e.target.value as ColorRule["op"] })}>
                    {RULE_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input className="pp-input" type="number" style={{ width: 52 }} value={rule.value}
                    onChange={(e) => updateRule(i, { value: Number(e.target.value) })} />
                  <input type="color" value={rule.color}
                    style={{ width: 24, height: 24, padding: 1, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                    onChange={(e) => updateRule(i, { color: e.target.value })} />
                  <button className="pp-cond-del" onClick={() => removeRule(i)} title="Remove">×</button>
                </div>
              ))}
              <button className="pp-btn-outline" style={{ marginTop: 6 }} onClick={addRule}>+ Add rule</button>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, lineHeight: 1.4 }}>
                Rules apply top-to-bottom. First match wins.
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Slice value preview ── */}
      {(widget.type === "donut" || widget.type === "pie") && donutSlices.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="pp-section-title" style={{ marginBottom: 6 }}>Slice Values</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {donutSlices.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text2)" }}>{s.label}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text1)", fontWeight: 500 }}>
                  {typeof s.value === "number" ? s.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )

}
