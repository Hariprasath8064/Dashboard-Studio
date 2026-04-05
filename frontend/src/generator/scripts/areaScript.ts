import { runAggregation } from "../../dataset/QueryEngine"
import { chartColors } from "../../constants/chartColors"
import { DEFAULT_COLOR, applyFilter, buildScalesOpts, DATA_LABEL_PLUGIN_SRC } from "./shared"

export function buildAreaScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const color = widget.color || DEFAULT_COLOR
  const datasets: any[] = [{
    label: widget.query.yColumn || widget.title, data: result.values,
    borderColor: color, backgroundColor: color + "33",
    tension: 0.4, fill: true, pointRadius: 3, yAxisID: "y"
  }]

  if (widget.y2Column) {
    const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
    const c2 = widget.y2Color || chartColors[1]
    datasets.push({ label: widget.y2Column, data: r2.values, borderColor: c2, backgroundColor: c2 + "33", tension: 0.4, fill: true, pointRadius: 3, yAxisID: "y2" })
  }

  const scales  = buildScalesOpts(widget, { y2: widget.y2Column ? {} : undefined })
  const opts    = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales }
  const plugins = widget.showDataLabels ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"line", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${JSON.stringify(opts)}, plugins:${plugins} }); }
 }`
}
