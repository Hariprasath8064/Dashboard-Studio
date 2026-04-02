import { useDashboardStore } from "../../store/dashboardStore"
import type { KPIWidget as KPIType } from "../../types/widgetTypes"

interface Props {
  widget: KPIType
}

function computeKPI(values: number[], aggregation: string, decimals: number): string {
  if (!values.length) return "--"
  const agg = (aggregation || "SUM").toUpperCase()
  let result: number
  switch (agg) {
    case "AVG":   result = values.reduce((a, b) => a + b, 0) / values.length; break
    case "COUNT": result = values.length; break
    case "MIN":   result = Math.min(...values); break
    case "MAX":   result = Math.max(...values); break
    default:      result = values.reduce((a, b) => a + b, 0)
  }
  return Number.isFinite(result)
    ? result.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : "--"
}

export default function KPIWidget({ widget }: Props) {

  const dataset = useDashboardStore((s) => s.dashboard.dataset)

  if (!dataset) {
    return (
      <div className="kpi-inner">
        <div className="kpi-empty">No dataset</div>
      </div>
    )
  }

  const columnIndex = dataset.columns.findIndex((c) => c.name === widget.valueColumn)

  const values = columnIndex >= 0
    ? dataset.rows.map((r) => Number(r[columnIndex])).filter((n) => Number.isFinite(n))
    : []

  const decimals = widget.decimals ?? 0
  const displayValue = computeKPI(values, widget.aggregation, decimals)

  const fontSize = widget.fontSize || 36

  return (

    <div className="kpi-inner">

      <div
        className="kpi-val"
        style={{
          color: widget.color || undefined,
          fontSize: `${fontSize}px`
        }}
      >
        {widget.prefix || ""}{displayValue}{widget.suffix || ""}
      </div>

      <div className="kpi-label-txt">
        {widget.label}
      </div>

      {widget.aggregation && widget.aggregation !== "SUM" && (
        <div className="kpi-agg-badge">{widget.aggregation}</div>
      )}

    </div>

  )

}