import { runAggregation } from "../dataset/QueryEngine"
import { chartColors } from "../constants/chartColors"
import type { ColorRule } from "../types/widgetTypes"

const DEFAULT_COLOR = "#2b7cff"
const TRACK_COLOR   = "#e2e8f0"

// ── Helpers ───────────────────────────────────────────────

function resolveColors(widget: any, count: number): string[] {
  if (Array.isArray(widget.barColors) && widget.barColors.length > 0) {
    const base = widget.barColors
    return Array.from({ length: count }, (_, i) => base[i] || base[base.length - 1] || DEFAULT_COLOR)
  }
  if (widget.color) return Array(count).fill(widget.color)
  return Array.from({ length: count }, (_, i) => chartColors[i % chartColors.length])
}

function resolveConditionalColors(widget: any, values: number[]): string[] {
  const rules: ColorRule[] = widget.colorRules || []
  return values.map((v, i) => {
    if (Array.isArray(widget.barColors) && widget.barColors[i]) return widget.barColors[i]
    for (const rule of rules) {
      if (matchRule(v, rule)) return rule.color
    }
    if (widget.color) return widget.color
    return chartColors[i % chartColors.length]
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

function applyFilter(result: { labels: string[]; values: number[] }, widget: any) {
  const topN = widget.filterTopN
  if (!topN || topN <= 0 || result.labels.length <= topN) return result
  const pairs = result.labels.map((l, i) => ({ l, v: result.values[i] }))
  pairs.sort((a, b) => b.v - a.v)
  const top = pairs.slice(0, topN)
  return { labels: top.map(p => p.l), values: top.map(p => p.v) }
}

function buildScalesOpts(widget: any, extra: Record<string, any> = {}) {
  const fs = widget.axisFontSize || 11
  const rot = widget.xTickRotation ?? 0
  return {
    x: {
      title: { display: !!widget.xAxisLabel, text: widget.xAxisLabel || "", font: { size: fs } },
      ticks: { maxRotation: rot, minRotation: rot, font: { size: fs } },
      grid: { color: "rgba(0,0,0,.05)" },
      ...extra.x
    },
    y: {
      title: { display: !!widget.yAxisLabel, text: widget.yAxisLabel || "", font: { size: fs } },
      ticks: { font: { size: fs } },
      beginAtZero: true,
      ...extra.y
    },
    ...(extra.y2 ? { y2: { type: "linear", position: "right", grid: { drawOnChartArea: false }, ticks: { font: { size: fs } }, title: { display: !!widget.y2Column, text: widget.y2Column || "", font: { size: fs } }, ...extra.y2 } } : {})
  }
}

const DATA_LABEL_PLUGIN_SRC = `{id:"dl",afterDatasetDraw(c){const{ctx}=c;c.data.datasets.forEach((_,i)=>{const m=c.getDatasetMeta(i);m.data.forEach((b,j)=>{const v=c.data.datasets[i].data[j];if(v==null||v===0)return;ctx.save();ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillStyle="#374151";ctx.font="bold 10px Inter,sans-serif";ctx.fillText(typeof v==="number"?v.toLocaleString(undefined,{maximumFractionDigits:1}):v,b.x,b.y-3);ctx.restore();})})}}`

// ── Gauge helper ──────────────────────────────────────────
function buildGaugeData(dataset: any, widget: any) {
  const result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  const total  = result.values.reduce((a: number, b: number) => a + b, 0) || 1
  const value  = result.values[0] ?? 0
  const pct    = Math.min(100, Math.max(0, (value / total) * 100))
  return { pct, label: result.labels[0] || widget.title, accent: widget.color || DEFAULT_COLOR }
}

export function buildChartScript(widget: any, dataset: any) {

  if (!dataset || !widget.query) return ""

  // ── Gauge ──
  if (widget.type === "gauge") {
    const g = buildGaugeData(dataset, widget)
    const data = { datasets: [{ data: [g.pct, 100 - g.pct], backgroundColor: [g.accent, TRACK_COLOR], borderWidth: 0, borderRadius: 4, circumference: 180, rotation: 270 }] }
    const opts = { responsive: true, maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false }, tooltip: { enabled: false } } }
    const gaugeLabel = JSON.stringify(g.label)
    const accent     = JSON.stringify(g.accent)
    const pct        = g.pct
    return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:"doughnut",
    data:${JSON.stringify(data)},
    options:${JSON.stringify(opts)},
    plugins:[{id:"gl",afterDraw(c){const{ctx:x,chartArea:{top,bottom,left,right}}=c;const cx=(left+right)/2,cy=bottom-(bottom-top)*0.08;x.save();x.textAlign="center";x.textBaseline="middle";x.font="bold 20px Inter,sans-serif";x.fillStyle=${accent};x.fillText("${Math.round(pct)}%",cx,cy-10);x.font="11px Inter,sans-serif";x.fillStyle="#94a3b8";x.fillText(${gaugeLabel},cx,cy+14);x.restore();}}]
   });
  }
 }`
  }

  // ── Timeline (horizontal bar) ──
  if (widget.type === "timeline") {
    let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
    result = applyFilter(result, widget)
    const colors = resolveColors(widget, result.values.length)
    const opts   = { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales: buildScalesOpts(widget, { x: { beginAtZero: true } }) }
    const ds = `{ label:${JSON.stringify(widget.title||"")}, data:${JSON.stringify(result.values)}, backgroundColor:${JSON.stringify(colors)}, borderWidth:0, borderRadius:3 }`
    return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:[${ds}] }, options:${JSON.stringify(opts)} }); }
 }`
  }

  // ── Scatter ──
  if (widget.type === "scatter") {
    const xIdx = dataset.columns.findIndex((c: any) => c.name === widget.query.xColumn)
    const yIdx = dataset.columns.findIndex((c: any) => c.name === widget.query.yColumn)
    if (xIdx < 0 || yIdx < 0) return ""
    const points = (dataset.rows as any[][]).reduce<{x:number;y:number}[]>((acc, row) => {
      const x = Number(row[xIdx]), y = Number(row[yIdx])
      if (Number.isFinite(x) && Number.isFinite(y)) acc.push({x, y})
      return acc
    }, [])
    const color = widget.color || DEFAULT_COLOR
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales: buildScalesOpts(widget, { x: { type: "linear" } }) }
    const ds = `{ label:${JSON.stringify(widget.title||"")}, data:${JSON.stringify(points)}, backgroundColor:${JSON.stringify(color+"99")}, borderColor:${JSON.stringify(color)}, borderWidth:1, pointRadius:4 }`
    return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"scatter", data:{ datasets:[${ds}] }, options:${JSON.stringify(opts)} }); }
 }`
  }

  // ── Radar ──
  if (widget.type === "radar") {
    let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
    result = applyFilter(result, widget)
    const color = widget.color || DEFAULT_COLOR
    const ds = `{ label:${JSON.stringify(widget.title||"")}, data:${JSON.stringify(result.values)}, borderColor:${JSON.stringify(color)}, backgroundColor:${JSON.stringify(color+"33")}, pointBackgroundColor:${JSON.stringify(color)}, pointRadius:3 }`
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales: { r: { beginAtZero: true } } }
    return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"radar", data:{ labels:${JSON.stringify(result.labels)}, datasets:[${ds}] }, options:${JSON.stringify(opts)} }); }
 }`
  }

  // ── Stacked Bar ──
  if (widget.type === "stacked-bar") {
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
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales: scaleOpts }
    const plugins = widget.showDataLabels ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"
    return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${JSON.stringify(opts)}, plugins:${plugins} }); }
 }`
  }

  // ── Area ──
  if (widget.type === "area") {
    let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
    result = applyFilter(result, widget)
    const color = widget.color || DEFAULT_COLOR
    const datasets: any[] = [{ label: widget.query.yColumn || widget.title, data: result.values, borderColor: color, backgroundColor: color + "33", tension: 0.4, fill: true, pointRadius: 3, yAxisID: "y" }]
    if (widget.y2Column) {
      const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
      const c2 = widget.y2Color || chartColors[1]
      datasets.push({ label: widget.y2Column, data: r2.values, borderColor: c2, backgroundColor: c2 + "33", tension: 0.4, fill: true, pointRadius: 3, yAxisID: "y2" })
    }
    const scales = buildScalesOpts(widget, { y2: widget.y2Column ? {} : undefined })
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: widget.showLegend !== false } }, scales }
    const plugins = widget.showDataLabels ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"
    return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"line", data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} }, options:${JSON.stringify(opts)}, plugins:${plugins} }); }
 }`
  }

  // ── Standard aggregation charts (bar, line, donut, pie) ──
  let result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  result = applyFilter(result, widget)

  const chartType = widget.type === "donut" ? "doughnut" : widget.type

  let datasets: any[]
  if (widget.type === "line") {
    // Dual Y support for line
    datasets = [{ label: widget.query.yColumn || widget.title, data: result.values, borderColor: widget.color || DEFAULT_COLOR, backgroundColor: widget.color || DEFAULT_COLOR, tension: 0.3, pointRadius: 3, fill: false, yAxisID: "y" }]
    if (widget.y2Column) {
      const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
      const c2 = widget.y2Color || chartColors[1]
      datasets.push({ label: widget.y2Column, data: r2.values, borderColor: c2, backgroundColor: c2, tension: 0.3, pointRadius: 3, fill: false, yAxisID: "y2" })
    }
  } else if (widget.type === "bar") {
    const colors = resolveConditionalColors(widget, result.values)
    datasets = [{ label: widget.query.yColumn || widget.title, data: result.values, backgroundColor: colors, borderWidth: 0, yAxisID: "y" }]
    if (widget.y2Column) {
      const r2 = runAggregation(dataset, widget.query.xColumn, widget.y2Column, widget.y2Aggregation || widget.query.aggregation)
      const y2Base = widget.y2Color || chartColors[1]
      const y2Colors = (Array.isArray(widget.y2BarColors) && widget.y2BarColors.length > 0)
        ? r2.values.map((_: number, i: number) => (widget.y2BarColors as string[])[i] || y2Base)
        : r2.values.map((_: number, i: number) => chartColors[(i + 3) % chartColors.length])
      datasets.push({ label: widget.y2Column, data: r2.values, backgroundColor: y2Colors, borderWidth: 0, yAxisID: "y2", type: "bar" })
    }
  } else {
    const colors = resolveColors(widget, result.values.length)
    datasets = [{ label: widget.title, data: result.values, backgroundColor: colors, borderWidth: 0 }]
  }

  const hasDualY = (widget.type === "bar" || widget.type === "line") && !!widget.y2Column
  const scalesBlock = (widget.type === "donut" || widget.type === "pie") ? undefined : buildScalesOpts(widget, { y2: hasDualY ? {} : undefined })
  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: widget.showLegend !== false } },
    ...(widget.type === "donut" ? { cutout: "70%" } : {}),
    ...(scalesBlock ? { scales: scalesBlock } : {})
  }

  const plugins = widget.showDataLabels && widget.type === "bar" ? `[${DATA_LABEL_PLUGIN_SRC}]` : "[]"

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:${JSON.stringify(chartType)},
    data:{ labels:${JSON.stringify(result.labels)}, datasets:${JSON.stringify(datasets)} },
    options:${JSON.stringify(opts)},
    plugins:${plugins}
   });
  }
 }`
}
