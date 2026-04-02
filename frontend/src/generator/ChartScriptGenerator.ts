import { runAggregation } from "../dataset/QueryEngine"
import { chartColors } from "../constants/chartColors"

const DEFAULT_COLOR = "#2b7cff"

function resolveColors(widget: any, count: number): string[] {
  // Per-bar colors take highest priority
  if (Array.isArray(widget.barColors) && widget.barColors.length > 0) {
    const base = widget.barColors
    return Array.from({ length: count }, (_, i) => base[i] || base[base.length - 1] || DEFAULT_COLOR)
  }
  // Single widget color paints all bars/slices one color
  if (widget.color) {
    return Array(count).fill(widget.color)
  }
  // Fallback: multi-color palette
  return Array.from({ length: count }, (_, i) => chartColors[i % chartColors.length])
}

export function buildChartScript(widget: any, dataset: any) {

  if (!dataset || !widget.query) return ""

  const result = runAggregation(
    dataset,
    widget.query.xColumn,
    widget.query.yColumn,
    widget.query.aggregation
  )

  const type = widget.type === "donut" ? "doughnut" : widget.type
  const colors = resolveColors(widget, result.values.length)
  const optionsConfig = buildOptionsConfig(widget.type, widget.showLegend)

  const datasetConfig =
    widget.type === "line"
      ? `{
                label:${JSON.stringify(widget.title || "")},
                data:${JSON.stringify(result.values)},
                borderColor:${JSON.stringify(widget.color || DEFAULT_COLOR)},
                backgroundColor:${JSON.stringify(widget.color || DEFAULT_COLOR)},
                tension:0.3,
                pointRadius:3,
                fill:false
                }`
      : `{
                label:${JSON.stringify(widget.title || "")},
                data:${JSON.stringify(result.values)},
                backgroundColor:${JSON.stringify(colors)},
                borderWidth:0
                }`

  return `
 {
  const ctx = document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:${JSON.stringify(type)},
    data:{
     labels:${JSON.stringify(result.labels)},
     datasets:[${datasetConfig}]
    },
    options:${JSON.stringify(optionsConfig)}
   });
  }
 }
 `
}

function buildOptionsConfig(type: string, showLegend?: boolean) {

  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend !== false
      }
    }
  }

  if (type === "donut") {
    return { ...base, cutout: "70%" }
  }

  return base
}