import type { BigfixQueryConfig } from "../types/bigfixTypes"
import type { Widget } from "../types/widgetTypes"

export function buildPropsToFetch(cfg: BigfixQueryConfig): string[] {
  const props = [cfg.dimension]
  if (cfg.metric) props.push(cfg.metric)
  cfg.additionalProps.forEach(ap => {
    if (!props.includes(ap)) props.push(ap)
  })
  return props
}

export function bigfixSourceLabel(objectType: string, when = new Date()): string {
  const t = when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return `BigFix: ${objectType} (${t})`
}

export function describeWidgetDataUse(widget: Widget): string {
  if (widget.type === "kpi") {
    const w = widget as any
    return `${w.aggregation || "SUM"}("${w.valueColumn || "—"}")`
  }
  if (widget.type === "table") {
    const w = widget as any
    const cols = (w.columns as string[])?.length ?? 0
    return cols ? `Table: ${(w.columns as string[]).slice(0, 4).join(", ")}${cols > 4 ? "…" : ""}` : "Table (no columns)"
  }
  if (widget.type === "text" || widget.type === "image") {
    return "No data binding"
  }
  const w = widget as any
  const q = w.query
  if (!q?.xColumn && !q?.yColumn) return "Configure X and Y columns"
  const agg = q.aggregation || "SUM"
  const top = w.filterTopN ? ` · top ${w.filterTopN}` : ""
  return `${agg}("${q.yColumn || "—"}") by "${q.xColumn || "—"}"${top}`
}
