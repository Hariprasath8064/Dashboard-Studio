import type { MouseEvent } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import type { ChartWidget, KPIWidget } from "../types/widgetTypes"

/** Returns a Chart.js onClick handler when drill-down is enabled, otherwise undefined. */
export function buildDrillDownClick(
  widget: ChartWidget,
  labels: string[],
): ((_event: any, elements: any[]) => void) | undefined {
  if (!widget.drillDown?.enabled) return undefined
  return (_event, elements) => {
    if (!elements.length) return
    const label = labels[elements[0].index]
    const st = useDashboardStore.getState()
    useDashboardStore.getState().openDrillDown({
      widgetTitle:    widget.title,
      filterLabel:    label,
      filterColumn:   widget.query.xColumn!,
      displayColumns: widget.drillDown?.displayColumns ?? [],
      dataSourceId:   widget.dataSourceId ?? st.activeDataSourceId ?? null,
    })
  }
}

/** Returns onClick handler for a KPI widget (shows all underlying rows). */
export function buildKpiDrillDownClick(
  widget: KPIWidget,
): ((e: MouseEvent) => void) | undefined {
  if (!widget.drillDown?.enabled) return undefined
  return (e) => {
    e.stopPropagation()
    const st = useDashboardStore.getState()
    useDashboardStore.getState().openDrillDown({
      widgetTitle:    widget.label || "KPI",
      filterLabel:    null,
      filterColumn:   null,
      displayColumns: widget.drillDown?.displayColumns ?? [],
      dataSourceId:   widget.dataSourceId ?? st.activeDataSourceId ?? null,
    })
  }
}

const DRILL_CHART_TYPES = new Set(["bar", "line", "pie", "donut", "stacked-bar"])

export function isDrillDownEnabled(widget: { type: string; drillDown?: { enabled?: boolean } }): boolean {
  if (!widget.drillDown?.enabled) return false
  if (widget.type === "kpi") return true
  return DRILL_CHART_TYPES.has(widget.type)
}
