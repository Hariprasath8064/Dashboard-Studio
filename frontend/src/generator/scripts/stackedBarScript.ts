import { runAggregation } from "../../dataset/QueryEngine"
import { chartColors } from "../../constants/chartColors"
import { resolveConditionalColors, applyFilter, buildScalesOpts, DATA_LABEL_PLUGIN_SRC, MULTI_COLOR_LEGEND_SRC } from "./shared"

function buildDdClickSrc(widget: any, labels: string[]): string {
  if (!widget.drillDown?.enabled) return ""
  const col  = JSON.stringify(widget.query?.xColumn ?? "")
  const cols = JSON.stringify(widget.drillDown.displayColumns ?? [])
  const lbls = JSON.stringify(labels)
  return `,onClick:function(_e,els){if(!els.length)return;var l=${lbls}[els[0].index];__showDrillDown(l,${col},${cols});}`
}

export function buildStackedBarScript(widget: any, dataset: any): string {
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)
  const colors = resolveConditionalColors(widget, result.values)
  const datasets: any[] = [{ label: widget.query.yColumn || "", data: result.values, backgroundColor: colors, borderWidth: 0, stack: "s1" }]

  if (widget.y2Column) {
    const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
    const y2Base = widget.y2Color || chartColors[1]
    const y2Colors = (Array.isArray(widget.y2BarColors) && widget.y2BarColors.length > 0)
      ? r2.values.map((_: number, i: number) => (widget.y2BarColors as string[])[i] || y2Base)
      : r2.values.map((_: number, i: number) => chartColors[(i + 3) % chartColors.length])
    datasets.push({ label: widget.y2Column, data: r2.values, backgroundColor: y2Colors, borderWidth: 0, stack: "s1" })
  }

  const scaleOpts = buildScalesOpts(widget, { x: { stacked: true }, y: { stacked: true } })
  const plugins   = widget.showDataLabels ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"
  const ddClick   = buildDdClickSrc(widget, result.labels)
  const optsStr   = `{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:${widget.showLegend !== false},labels:${MULTI_COLOR_LEGEND_SRC}}},scales:${JSON.stringify(scaleOpts)}${ddClick}}`

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${optsStr}, plugins:${plugins} }); }
 }`
}
