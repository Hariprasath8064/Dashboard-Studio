import type { ChartWidget, ColorRule } from "../types/widgetTypes"
import { chartColors } from "../constants/chartColors"
import { useDashboardStore } from "../store/dashboardStore"

const DEFAULT_COLOR = "#2b7cff"

/**
 * Returns the chart palette from the active theme.
 * Called at render time (inside useEffect / event handlers), so it reads the
 * latest store state synchronously without needing a React hook.
 */
function getActivePalette(): string[] {
  return useDashboardStore.getState().dashboard.theme?.chartPalette ?? chartColors
}

/** Apply filterTopN — keep the top N values by magnitude */
export function applyFilter(
  result: { labels: string[]; values: number[] },
  widget: ChartWidget
): { labels: string[]; values: number[] } {
  const topN = widget.filterTopN
  if (!topN || topN <= 0 || result.labels.length <= topN) return result

  // Sort descending by value, take top N
  const pairs = result.labels.map((l, i) => ({ l, v: result.values[i] }))
  pairs.sort((a, b) => b.v - a.v)
  const top = pairs.slice(0, topN)
  return { labels: top.map((p) => p.l), values: top.map((p) => p.v) }
}

/** Resolve per-bar colors — applying colorRules conditionally if set */
export function resolveConditionalColors(widget: ChartWidget, values: number[]): string[] {
  const rules: ColorRule[] = widget.colorRules || []
  const palette = getActivePalette()

  return values.map((v, i) => {
    // Per-bar explicit color takes highest priority
    if (Array.isArray(widget.barColors) && widget.barColors.length > i && widget.barColors[i]) {
      return widget.barColors[i]!
    }
    // Conditional coloring rules
    for (const rule of rules) {
      if (matchRule(v, rule)) return rule.color
    }
    // Single widget color
    if (widget.color) return widget.color
    // Active theme palette fallback
    return palette[i % palette.length]
  })
}

function matchRule(value: number, rule: ColorRule): boolean {
  switch (rule.op) {
    case "lt":  return value <  rule.value
    case "lte": return value <= rule.value
    case "gt":  return value >  rule.value
    case "gte": return value >= rule.value
    case "eq":  return value === rule.value
    default:    return false
  }
}

/** Standard resolveColors (no conditional rules) used by existing widgets */
export function resolveColors(widget: ChartWidget, count: number): string[] {
  if (Array.isArray(widget.barColors) && widget.barColors.length > 0) {
    const base = widget.barColors
    return Array.from({ length: count }, (_, i) => base[i] || base[base.length - 1] || DEFAULT_COLOR)
  }
  if (widget.color) return Array(count).fill(widget.color)
  const palette = getActivePalette()
  return Array.from({ length: count }, (_, i) => palette[i % palette.length])
}

/**
 * Chart.js legend `labels` config that works correctly when any dataset uses
 * an array of distinct bar colours (e.g. default palette cycling).
 * — Multi-colour dataset → one legend item per category with its bar colour
 * — Single-colour dataset → one legend item for the dataset label
 * Drop this into any bar / stacked-bar / timeline chart's `legend.labels`.
 */
export const multiColorLegendLabels = {
  generateLabels(chart: any): any[] {
    const chartLabels = (chart.data.labels || []) as string[]
    const items: any[] = []
    chart.data.datasets.forEach((ds: any, di: number) => {
      const bg     = ds.backgroundColor
      const bgArr  = Array.isArray(bg) ? (bg as string[]) : null
      const isMulti = bgArr !== null && new Set(bgArr).size > 1
      if (isMulti) {
        chartLabels.forEach((text: string, i: number) => {
          items.push({
            text,
            fillStyle:   bgArr![i] || bgArr![0] || "#2b7cff",
            strokeStyle: "transparent",
            lineWidth:   0,
            hidden:      false,
            datasetIndex: di,
            index:       i,
          })
        })
      } else {
        const c = bgArr ? bgArr[0] : (typeof bg === "string" ? bg : (ds.borderColor || "#2b7cff"))
        items.push({
          text:        ds.label || "",
          fillStyle:   c || "#2b7cff",
          strokeStyle: "transparent",
          lineWidth:   0,
          hidden:      false,
          datasetIndex: di,
          index:       0,
        })
      }
    })
    return items
  }
}

/** Shared data-label plugin for bar charts */
export const dataLabelPlugin = {
  id: "dl",
  afterDatasetDraw(chart: any) {
    const { ctx } = chart
    chart.data.datasets.forEach((_: any, i: number) => {
      const meta = chart.getDatasetMeta(i)
      meta.data.forEach((bar: any, idx: number) => {
        const v = chart.data.datasets[i].data[idx]
        if (v == null || v === 0) return
        ctx.save()
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        ctx.fillStyle = "#374151"
        ctx.font = "bold 10px Inter,sans-serif"
        ctx.fillText(
          typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : String(v),
          bar.x,
          bar.y - 3
        )
        ctx.restore()
      })
    })
  }
}

/** Line/area point styling + hit area so tooltips and drill-down clicks register reliably */
export function linePointDatasetOpts(color: string) {
  return {
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 8,
    pointHitRadius: 18,
    pointBackgroundColor: color,
    pointBorderColor: "#ffffff",
    pointBorderWidth: 2,
  }
}

/** Hover tooltip + click target along the x-axis column, not only on the tiny dot */
export const LINE_CHART_INTERACTION = {
  interaction: { mode: "index" as const, intersect: false },
  hover:       { mode: "index" as const, intersect: false },
  elements: {
    point: { radius: 4, hitRadius: 18, hoverRadius: 8 },
  },
}

/** Build standard Chart.js scales config from widget axis options */
export function buildScalesConfig(widget: ChartWidget, extra: Record<string, any> = {}) {
  const fontSize = widget.axisFontSize || 11
  return {
    x: {
      title: { display: !!widget.xAxisLabel, text: widget.xAxisLabel || "", font: { size: fontSize } },
      ticks: { maxRotation: widget.xTickRotation ?? 0, minRotation: widget.xTickRotation ?? 0, font: { size: fontSize } },
      grid: { color: "rgba(0,0,0,.05)" },
      ...extra.x,
    },
    y: {
      title: { display: !!widget.yAxisLabel, text: widget.yAxisLabel || "", font: { size: fontSize } },
      ticks: { font: { size: fontSize } },
      beginAtZero: true,
      ...extra.y,
    },
    ...(extra.y2 ? {
      y2: {
        type: "linear" as const,
        position: "right" as const,
        grid: { drawOnChartArea: false },
        ticks: { font: { size: fontSize } },
        title: { display: !!widget.y2Column, text: widget.y2Column || "", font: { size: fontSize } },
        ...extra.y2,
      }
    } : {})
  }
}
