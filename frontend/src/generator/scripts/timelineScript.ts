import { runAggregation } from "../../dataset/QueryEngine"
import { resolveColors, applyFilter, buildScalesOpts, MULTI_COLOR_LEGEND_SRC } from "./shared"

export function buildTimelineScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const colors   = resolveColors(widget, result.values.length)
  const scales   = buildScalesOpts(widget, { x: { beginAtZero: true } })
  const optsStr  = `{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:${widget.showLegend !== false},labels:${MULTI_COLOR_LEGEND_SRC}}},scales:${JSON.stringify(scales)}}`
  const ds = `{ label:${JSON.stringify(widget.title || "")}, data:${JSON.stringify(result.values)}, backgroundColor:${JSON.stringify(colors)}, borderWidth:0, borderRadius:3 }`
  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:[${ds}] }, options:${optsStr} }); }
 }`
}
