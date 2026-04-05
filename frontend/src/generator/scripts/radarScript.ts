import { runAggregation } from "../../dataset/QueryEngine"
import { DEFAULT_COLOR, applyFilter } from "./shared"

export function buildRadarScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const color = widget.color || DEFAULT_COLOR
  const ds   = `{ label:${JSON.stringify(widget.title || "")}, data:${JSON.stringify(result.values)}, borderColor:${JSON.stringify(color)}, backgroundColor:${JSON.stringify(color + "33")}, pointBackgroundColor:${JSON.stringify(color)}, pointRadius:3 }`
  const opts  = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: widget.showLegend !== false } },
    scales: { r: { beginAtZero: true } }
  }
  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"radar", data:{ labels:${JSON.stringify(result.labels)}, datasets:[${ds}] }, options:${JSON.stringify(opts)} }); }
 }`
}
