import { useDashboardStore } from "../store/dashboardStore"
import type  { ChartWidget } from "../types/widgetTypes"
import { runAggregation } from "../dataset/QueryEngine"
import { chartColors } from "../constants/chartColors"

interface Props {
  widget: ChartWidget
}

export default function ChartProperties({ widget }: Props) {

  const dataset = useDashboardStore((s) => s.dashboard.dataset)
  const updateWidget = useDashboardStore((s) => s.updateWidget)

  if (!dataset) {
    return <div className="pp-section">Upload a dataset first</div>
  }

  function update(field: string, value: any) {

    updateWidget({
      ...widget,
      query: {
        ...widget.query,
        [field]: value
      }
    })

  }

  // Compute slice values for donut preview
  let donutSlices: { label: string; value: number; color: string }[] = []
  if (
    widget.type === "donut" &&
    dataset &&
    widget.query.xColumn &&
    widget.query.yColumn
  ) {
    try {
      const result = runAggregation(
        dataset,
        widget.query.xColumn,
        widget.query.yColumn,
        widget.query.aggregation || "SUM"
      )
      const total = result.values.reduce((s, v) => s + v, 0)
      donutSlices = result.labels.map((label, i) => {
        const sliceColor =
          (Array.isArray(widget.barColors) && widget.barColors[i]) ||
          chartColors[i % chartColors.length]
        return { label, value: result.values[i], color: sliceColor }
      })
      void total
    } catch {
      donutSlices = []
    }
  }

  return (

    <div className="pp-section">

      <div className="pp-section-title">Chart Config</div>

      <div className="pp-row">
        <span className="pp-label">Title</span>
        <input
          className="pp-input"
          value={widget.title}
          onChange={(e) =>
            updateWidget({ ...widget, title: e.target.value })
          }
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">X Axis</span>

        <select
          className="pp-select"
          value={widget.query.xColumn || ""}
          onChange={(e) => update("xColumn", e.target.value)}
        >

          <option value="">Select column</option>

          {dataset.columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      <div className="pp-row">
        <span className="pp-label">Y Axis</span>

        <select
          className="pp-select"
          value={widget.query.yColumn || ""}
          onChange={(e) => update("yColumn", e.target.value)}
        >

          <option value="">Select column</option>

          {dataset.columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      <div className="pp-row">

        <span className="pp-label">Aggregation</span>

        <select
          className="pp-select"
          value={widget.query.aggregation}
          onChange={(e) => update("aggregation", e.target.value)}
        >

          <option value="SUM">SUM</option>
          <option value="AVG">AVG</option>
          <option value="COUNT">COUNT</option>
          <option value="MIN">MIN</option>
          <option value="MAX">MAX</option>

        </select>

      </div>

      {widget.type === "donut" && donutSlices.length > 0 && (
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