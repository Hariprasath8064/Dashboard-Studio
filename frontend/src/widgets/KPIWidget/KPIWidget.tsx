import { useWidgetDataset } from "../../hooks/useWidgetDataset"
import type { KPIWidget as KPIType } from "../../types/widgetTypes"
import { buildKpiDrillDownClick } from "../../utils/drillDownHelpers"

interface Props {
  widget: KPIType
}

function aggregate(values: number[], agg: string): number | null {
  if (!values.length) return null
  switch ((agg || "SUM").toUpperCase()) {
    case "AVG":   return values.reduce((a, b) => a + b, 0) / values.length
    case "COUNT": return values.length
    case "MIN":   return Math.min(...values)
    case "MAX":   return Math.max(...values)
    default:      return values.reduce((a, b) => a + b, 0)
  }
}

export function formatKpiNumber(
  value: number,
  format: string | undefined,
  decimals: number,
): string {
  const d = decimals ?? 0
  const abs = Math.abs(value)
  const fmt = format ?? "auto"

  if (fmt === "full") {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })
  }
  if (fmt === "b" || (fmt === "auto" && abs >= 1_000_000_000)) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
  }
  if (fmt === "m" || (fmt === "auto" && abs >= 1_000_000)) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (fmt === "k" || (fmt === "auto" && abs >= 10_000)) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
}

function getColumnValues(
  dataset: any,
  colName: string,
): number[] {
  if (!dataset || !colName) return []
  const idx = dataset.columns.findIndex((c: any) => c.name === colName)
  if (idx < 0) return []
  return dataset.rows
    .map((r: any) => Number(r[idx]))
    .filter((n: number) => Number.isFinite(n))
}

export default function KPIWidget({ widget }: Props) {

  const dataset = useWidgetDataset(widget)

  if (!dataset) {
    return (
      <div className="kpi-inner">
        <div className="kpi-empty">No dataset</div>
      </div>
    )
  }

  const decimals  = widget.decimals ?? 0
  const fmt       = widget.numberFormat ?? "auto"
  const agg       = widget.aggregation || "SUM"

  const primaryVals = getColumnValues(dataset, widget.valueColumn)
  const primaryRaw  = aggregate(primaryVals, agg)
  const primaryStr  = primaryRaw !== null
    ? `${widget.prefix ?? ""}${formatKpiNumber(primaryRaw, fmt, decimals)}${widget.suffix ?? ""}`
    : "--"

  // Comparison
  const cmpType = widget.comparisonType ?? "none"
  let deltaNode: React.ReactNode = null

  if (cmpType !== "none" && primaryRaw !== null) {
    let cmpRaw: number | null = null

    if (cmpType === "column" && widget.comparisonColumn) {
      const cmpVals = getColumnValues(dataset, widget.comparisonColumn)
      cmpRaw = aggregate(cmpVals, agg)
    } else if (cmpType === "target" && widget.comparisonTarget != null) {
      cmpRaw = widget.comparisonTarget
    }

    if (cmpRaw !== null && cmpRaw !== 0) {
      const delta    = primaryRaw - cmpRaw
      const pct      = (delta / Math.abs(cmpRaw)) * 100
      const isUp     = delta > 0
      const isNeutral = delta === 0
      const polarity = widget.polarity ?? "higher"

      // good = green, bad = red
      const isGood = isNeutral
        ? null
        : polarity === "higher" ? isUp : !isUp

      const colorClass = isNeutral
        ? "kpi-delta--neutral"
        : isGood ? "kpi-delta--good" : "kpi-delta--bad"

      const arrow  = isNeutral ? "▶" : isUp ? "▲" : "▼"
      const sign   = isUp ? "+" : ""
      const deltaFmt = formatKpiNumber(delta, fmt, decimals)
      const pctFmt   = Math.abs(pct).toFixed(1) + "%"
      const lbl      = widget.comparisonLabel ? ` ${widget.comparisonLabel}` : ""

      deltaNode = (
        <div className={`kpi-delta ${colorClass}`}>
          <span className="kpi-delta-arrow">{arrow}</span>
          <span className="kpi-delta-nums">
            {sign}{deltaFmt}
            <span className="kpi-delta-pct">({sign}{pctFmt}){lbl}</span>
          </span>
        </div>
      )
    }
  }

  const fontSize = widget.fontSize || 36

  const onKpiClick = buildKpiDrillDownClick(widget)

  return (
    <div
      className={`kpi-inner${onKpiClick ? " kpi-clickable" : ""}`}
      onClick={onKpiClick}
    >

      <div className="kpi-label-txt">
        {widget.label || "KPI"}
      </div>

      <div
        className="kpi-val"
        style={{
          color:    widget.color || undefined,
          fontSize: `${fontSize}px`,
        }}
      >
        {primaryStr}
      </div>

      {deltaNode}

    </div>
  )

}
