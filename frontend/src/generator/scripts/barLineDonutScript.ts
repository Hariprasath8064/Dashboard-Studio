import { runAggregation } from "../../dataset/QueryEngine"
import { chartColors } from "../../constants/chartColors"
import { DEFAULT_COLOR, resolveConditionalColors, resolveColors, applyFilter, buildScalesOpts, DATA_LABEL_PLUGIN_SRC, MULTI_COLOR_LEGEND_SRC } from "./shared"

/** Returns the onClick option fragment when drill-down is enabled, or empty string. */
function buildDdClickSrc(widget: any, labels: string[]): string {
  if (!widget.drillDown?.enabled) return ""
  const col  = JSON.stringify(widget.query?.xColumn ?? "")
  const cols  = JSON.stringify(widget.drillDown.displayColumns ?? [])
  const lbls  = JSON.stringify(labels)
  return `,onClick:function(_e,els){if(!els.length)return;var l=${lbls}[els[0].index];__showDrillDown(l,${col},${cols});}`
}

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

  const hasDualY = !!widget.y2Column
  const scales   = buildScalesOpts(widget, { y2: hasDualY ? {} : undefined })
  const plugins  = widget.showDataLabels ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"
  const ddClick  = buildDdClickSrc(widget, result.labels)
  const optsStr  = `{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:${widget.showLegend !== false},labels:${MULTI_COLOR_LEGEND_SRC}}},scales:${JSON.stringify(scales)}${ddClick}}`

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${optsStr}, plugins:${plugins} }); }
 }`
}

function lineDsPointOpts(color: string) {
  return {
    borderWidth: 2, pointRadius: 4, pointHoverRadius: 8, pointHitRadius: 18,
    pointBackgroundColor: color, pointBorderColor: "#ffffff", pointBorderWidth: 2,
  }
}

export function buildLineScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const c1 = widget.color || DEFAULT_COLOR
  const datasets: any[] = [{
    label: widget.query.yColumn || widget.title, data: result.values,
    borderColor: c1, backgroundColor: c1,
    tension: 0.3, fill: false, yAxisID: "y",
    ...lineDsPointOpts(c1),
  }]

  if (widget.y2Column) {
    const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
    const c2 = widget.y2Color || chartColors[1]
    datasets.push({
      label: widget.y2Column, data: r2.values, borderColor: c2, backgroundColor: c2,
      tension: 0.3, fill: false, yAxisID: "y2",
      ...lineDsPointOpts(c2),
    })
  }

  const hasDualY = !!widget.y2Column
  const scales   = buildScalesOpts(widget, { y2: hasDualY ? {} : undefined })
  const ddClick  = buildDdClickSrc(widget, result.labels)
  const optsStr  = `{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},hover:{mode:"index",intersect:false},elements:{point:{radius:4,hitRadius:18,hoverRadius:8}},plugins:{legend:{display:${widget.showLegend !== false}},tooltip:{enabled:true}},scales:${JSON.stringify(scales)}${ddClick}}`

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"line", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${optsStr} }); }
 }`
}

export function buildDonutPieScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const colors   = resolveColors(widget, result.values.length)
  const chartType = widget.type === "donut" ? "doughnut" : "pie"
  const datasets  = [{ label: widget.title, data: result.values, backgroundColor: colors, borderWidth: 0 }]
  const ddClick   = buildDdClickSrc(widget, result.labels)
  const cutout    = widget.type === "donut" ? `,cutout:"70%"` : ""
  const optsStr   = `{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:${widget.showLegend !== false}}}${cutout}${ddClick}}`

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:${JSON.stringify(chartType)}, data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${optsStr} }); }
 }`
}
