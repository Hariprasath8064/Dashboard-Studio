import { runAggregation } from "../../dataset/QueryEngine"
import { chartColors } from "../../constants/chartColors"
import { DEFAULT_COLOR, resolveConditionalColors, resolveColors, applyFilter, buildScalesOpts, DATA_LABEL_PLUGIN_SRC } from "./shared"

export function buildBarScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const colors = resolveConditionalColors(widget, result.values)
  const datasets: any[] = [{ label: widget.query.yColumn || widget.title, data: result.values, backgroundColor: colors, borderWidth: 0, yAxisID: "y" }]

  if (widget.y2Column) {
    const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
    const y2Base = widget.y2Color || chartColors[1]
    const y2Colors = (Array.isArray(widget.y2BarColors) && widget.y2BarColors.length > 0)
      ? r2.values.map((_: number, i: number) => (widget.y2BarColors as string[])[i] || y2Base)
      : r2.values.map((_: number, i: number) => chartColors[(i + 3) % chartColors.length])
    datasets.push({ label: widget.y2Column, data: r2.values, backgroundColor: y2Colors, borderWidth: 0, yAxisID: "y2", type: "bar" })
  }

  const hasDualY  = !!widget.y2Column
  const hasPerBar = Array.isArray(widget.barColors) && widget.barColors.length > 0
  const scales    = buildScalesOpts(widget, { y2: hasDualY ? {} : undefined })
  const plugins   = widget.showDataLabels ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"

  const legendStr = hasPerBar
    ? `{display:${widget.showLegend !== false},labels:{generateLabels(c){const bg=Array.isArray(c.data.datasets[0]?.backgroundColor)?c.data.datasets[0].backgroundColor:[];return(c.data.labels||[]).map((l,i)=>({text:String(l),fillStyle:bg[i]||bg[0]||"#2b7cff",strokeStyle:"transparent",hidden:false,datasetIndex:0}));}}}`
    : `{display:${widget.showLegend !== false}}`
  const optsStr = `{responsive:true,maintainAspectRatio:false,plugins:{legend:${legendStr}},scales:${JSON.stringify(scales)}}`

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${optsStr}, plugins:${plugins} }); }
 }`
}

export function buildLineScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const datasets: any[] = [{
    label: widget.query.yColumn || widget.title, data: result.values,
    borderColor: widget.color || DEFAULT_COLOR, backgroundColor: widget.color || DEFAULT_COLOR,
    tension: 0.3, pointRadius: 3, fill: false, yAxisID: "y"
  }]

  if (widget.y2Column) {
    const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
    const c2 = widget.y2Color || chartColors[1]
    datasets.push({ label: widget.y2Column, data: r2.values, borderColor: c2, backgroundColor: c2, tension: 0.3, pointRadius: 3, fill: false, yAxisID: "y2" })
  }

  const hasDualY = !!widget.y2Column
  const scales   = buildScalesOpts(widget, { y2: hasDualY ? {} : undefined })
  const opts     = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales }

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"line", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${JSON.stringify(opts)} }); }
 }`
}

export function buildDonutPieScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const colors   = resolveColors(widget, result.values.length)
  const chartType = widget.type === "donut" ? "doughnut" : "pie"
  const datasets  = [{ label: widget.title, data: result.values, backgroundColor: colors, borderWidth: 0 }]
  const opts      = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: widget.showLegend !== false } },
    ...(widget.type === "donut" ? { cutout: "70%" } : {})
  }

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:${JSON.stringify(chartType)}, data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${JSON.stringify(opts)} }); }
 }`
}
