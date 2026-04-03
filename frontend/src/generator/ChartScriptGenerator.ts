import { runAggregation } from "../dataset/QueryEngine"
import { chartColors } from "../constants/chartColors"

const DEFAULT_COLOR = "#2b7cff"
const TRACK_COLOR   = "#e2e8f0"

function resolveColors(widget: any, count: number): string[] {
  if (Array.isArray(widget.barColors) && widget.barColors.length > 0) {
    const base = widget.barColors
    return Array.from({ length: count }, (_, i) => base[i] || base[base.length - 1] || DEFAULT_COLOR)
  }
  if (widget.color) return Array(count).fill(widget.color)
  return Array.from({ length: count }, (_, i) => chartColors[i % chartColors.length])
}

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
  const ctx = document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:"doughnut",
    data:${JSON.stringify(data)},
    options:${JSON.stringify(opts)},
    plugins:[{
     id:"gl",
     afterDraw(c){
      const{ctx:x,chartArea:{top,bottom,left,right}}=c;
      const cx=(left+right)/2, cy=bottom-(bottom-top)*0.08;
      x.save();x.textAlign="center";x.textBaseline="middle";
      x.font="bold 20px Inter,sans-serif";x.fillStyle=${accent};
      x.fillText("${Math.round(pct)}%",cx,cy-10);
      x.font="11px Inter,sans-serif";x.fillStyle="#94a3b8";
      x.fillText(${gaugeLabel},cx,cy+14);x.restore();
     }
    }]
   });
  }
 }`
  }

  // ── Timeline (horizontal bar) ──
  if (widget.type === "timeline") {
    const result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
    const colors  = resolveColors(widget, result.values.length)
    const opts    = {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
    const ds = `{ label:${JSON.stringify(widget.title||"")}, data:${JSON.stringify(result.values)}, backgroundColor:${JSON.stringify(colors)}, borderWidth:0, borderRadius:3 }`
    return `
 {
  const ctx = document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"bar", data:{ labels:${JSON.stringify(result.labels)}, datasets:[${ds}] }, options:${JSON.stringify(opts)} }); }
 }`
  }

  // ── Standard aggregation charts (bar, line, donut, pie) ──
  const result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  const colors  = resolveColors(widget, result.values.length)

  const chartType = widget.type === "donut" ? "doughnut" : widget.type

  const datasetConfig =
    widget.type === "line"
      ? `{
          label:${JSON.stringify(widget.title || "")},
          data:${JSON.stringify(result.values)},
          borderColor:${JSON.stringify(widget.color || DEFAULT_COLOR)},
          backgroundColor:${JSON.stringify(widget.color || DEFAULT_COLOR)},
          tension:0.3, pointRadius:3, fill:false
        }`
      : `{
          label:${JSON.stringify(widget.title || "")},
          data:${JSON.stringify(result.values)},
          backgroundColor:${JSON.stringify(colors)},
          borderWidth:0
        }`

  const opts = buildStandardOptions(widget.type, widget.showLegend)

  return `
 {
  const ctx = document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:${JSON.stringify(chartType)},
    data:{ labels:${JSON.stringify(result.labels)}, datasets:[${datasetConfig}] },
    options:${JSON.stringify(opts)}
   });
  }
 }`
}

function buildStandardOptions(type: string, showLegend?: boolean) {
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: showLegend !== false } }
  }
  if (type === "donut") return { ...base, cutout: "70%" }
  return base
}