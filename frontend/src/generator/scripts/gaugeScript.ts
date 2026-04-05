import { runAggregation } from "../../dataset/QueryEngine"
import { DEFAULT_COLOR, TRACK_COLOR } from "./shared"

export function buildGaugeScript(widget: any, dataset: any): string {
  const result = runAggregation(dataset, widget.query.xColumn, widget.query.yColumn, widget.query.aggregation)
  const total  = result.values.reduce((a: number, b: number) => a + b, 0) || 1
  const value  = result.values[0] ?? 0
  const pct    = Math.min(100, Math.max(0, (value / total) * 100))
  const label  = result.labels[0] || widget.title
  const accent = widget.color || DEFAULT_COLOR

  const data = {
    datasets: [{
      data: [pct, 100 - pct],
      backgroundColor: [accent, TRACK_COLOR],
      borderWidth: 0, borderRadius: 4, circumference: 180, rotation: 270
    }]
  }
  const opts = {
    responsive: true, maintainAspectRatio: false, cutout: "72%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  }

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){
   new Chart(ctx,{
    type:"doughnut",
    data:${JSON.stringify(data)},
    options:${JSON.stringify(opts)},
    plugins:[{id:"gl",afterDraw(c){const{ctx:x,chartArea:{top,bottom,left,right}}=c;const cx=(left+right)/2,cy=bottom-(bottom-top)*0.08;x.save();x.textAlign="center";x.textBaseline="middle";x.font="bold 20px Inter,sans-serif";x.fillStyle=${JSON.stringify(accent)};x.fillText("${Math.round(pct)}%",cx,cy-10);x.font="11px Inter,sans-serif";x.fillStyle="#94a3b8";x.fillText(${JSON.stringify(label)},cx,cy+14);x.restore();}}]
   });
  }
 }`
}
