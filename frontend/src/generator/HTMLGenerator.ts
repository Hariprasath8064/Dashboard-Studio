import { buildChartScript } from "./ChartScriptGenerator"

const EXPORT_STYLES = `
:root{
 --surface:#ffffff;
 --border:#e3e6ea;
 --accent:#2b7cff;
 --bg:#f4f6f9;
}
*{
 box-sizing:border-box;
}
body{
 margin:0;
 font-family:Inter, Arial, sans-serif;
 background:var(--bg);
 color:#1b1f24;
}
.export-shell{
 min-height:100vh;
 padding:40px;
 background:var(--bg);
 display:flex;
 justify-content:center;
 align-items:flex-start;
 overflow-x:auto;
}
.export-dashboard{
 position:relative;
 border-radius:8px;
 background:var(--surface);
 box-shadow:0 12px 40px rgba(15,23,42,0.1);
 flex-shrink:0;
}
.widget{
 position:absolute;
 background:var(--surface);
 border:1px solid var(--border);
 border-radius:8px;
 box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -1px rgba(0,0,0,.03);
 overflow:visible;
}
.widget-inner{
 width:100%;
 height:100%;
 overflow:hidden;
 border-radius:8px;
 display:flex;
 flex-direction:column;
}
.chart-inner{
 padding:12px 16px;
 height:100%;
 display:flex;
 flex-direction:column;
}
.chart-inner canvas{
 flex:1;
 min-height:0;
 width:100% !important;
}
.wg-title{
 padding:12px 16px 0;
 font-weight:600;
 font-size:13px;
 color:#1b1f24;
 flex-shrink:0;
}
.kpi-inner{
 padding:16px 20px;
 height:100%;
 display:flex;
 flex-direction:column;
 align-items:center;
 justify-content:center;
 gap:6px;
}
.kpi-val{
 font-size:36px;
 font-weight:700;
 line-height:1;
}
.kpi-label-txt{
 font-size:12px;
 font-weight:500;
 color:#5a5f66;
 text-transform:uppercase;
 letter-spacing:0.04em;
 text-align:center;
}
.text-inner{
 padding:16px 18px;
 height:100%;
 overflow:hidden;
}
.text-wg-h1{
 font-size:18px;
 font-weight:500;
 color:#1b1f24;
 margin-bottom:6px;
}
.text-wg-p{
 font-size:13px;
 color:#5a5f66;
 line-height:1.6;
}
.table-shell{ width:100%; height:100%; overflow:auto; }
.tw-table{ width:100%; border-collapse:collapse; font-size:13px; table-layout:fixed; }
.tw-table th{ padding:8px 10px; font-weight:600; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tw-table td{ padding:6px 10px; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tw-default .tw-table th{ background:#f4f6f9; border-bottom:2px solid #d8dde5; color:#374151; }
.tw-default .tw-table td{ border-bottom:1px solid #e9ecef; color:#1b1f24; }
.tw-default .tw-table tr:last-child td{ border-bottom:none; }
.tw-striped .tw-table th{ background:#f4f6f9; border-bottom:2px solid #d8dde5; color:#374151; }
.tw-striped .tw-table tbody tr:nth-child(even) td{ background:#f0f4fa; }
.tw-striped .tw-table td{ border-bottom:1px solid #eef0f2; color:#1b1f24; }
.tw-bordered .tw-table{ border:1px solid #c5cad0; }
.tw-bordered .tw-table th,.tw-bordered .tw-table td{ border:1px solid #d5dae0; }
.tw-bordered .tw-table th{ background:#f4f6f9; color:#374151; }
.tw-minimal .tw-table th{ border-bottom:2px solid #1b1f24; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }
.tw-minimal .tw-table td{ border-bottom:1px solid #f0f2f4; color:#374151; }
.tw-minimal .tw-table tr:last-child td{ border-bottom:none; }
.tw-dark .tw-table th{ background:#1b2230; color:#ffffff; border-bottom:none; }
.tw-dark .tw-table tbody tr:nth-child(even) td{ background:#f8f9fb; }
.tw-dark .tw-table td{ border-bottom:1px solid #e9ecef; color:#1b1f24; }
.tw-blue .tw-table th{ background:#2b7cff; color:#ffffff; border-bottom:none; }
.tw-blue .tw-table tbody tr:nth-child(even) td{ background:#eff5ff; }
.tw-blue .tw-table td{ border-bottom:1px solid #dde8ff; color:#1b1f24; }
.tw-green .tw-table th{ background:#059669; color:#ffffff; border-bottom:none; }
.tw-green .tw-table tbody tr:nth-child(even) td{ background:#f0fdf7; }
.tw-green .tw-table td{ border-bottom:1px solid #d1fae5; color:#1b1f24; }
.tw-rose .tw-table th{ background:#e11d48; color:#ffffff; border-bottom:none; }
.tw-rose .tw-table tbody tr:nth-child(even) td{ background:#fff1f4; }
.tw-rose .tw-table td{ border-bottom:1px solid #fecdd3; color:#1b1f24; }
.tw-stats-row td{ font-weight:700; background:#f4f6f9 !important; border-top:2px solid #d8dde5 !important; font-size:12px; }
.empty-state{
 flex:1;
 display:flex;
 align-items:center;
 justify-content:center;
 color:#a3a9b6;
 font-size:14px;
}
`

export function buildHTML(dashboard:any){

 const dataset = dashboard?.dataset ?? null
 const datasetColumns = Array.isArray(dataset?.columns) ? dataset.columns : []
 const datasetRows = Array.isArray(dataset?.rows) ? dataset.rows : []
 const widgets = Array.isArray(dashboard?.widgets) ? dashboard.widgets : []
 const canvasWidth = dashboard?.canvas?.width ?? 1200
 const canvasHeight = Math.max(
                            dashboard?.canvas?.height ?? 800,
                            ...widgets.map((w:any)=>w.position.y + w.size.height + 40)
                            )

 const widgetsHTML = widgets
  .map((w:any)=>renderWidgetHTML(w,datasetColumns,datasetRows))
  .join("")

 const chartBlocks = widgets
  .map((w:any)=>buildChartScript(w,dashboard?.dataset ?? null))
  .filter(Boolean)

 const chartsSection = chartBlocks.length
  ? `<script>
(function(){
 const MAX_TRIES = 60;
 function renderCharts(){
${chartBlocks.join("\n")}
 }
 function start(trial){
  if(typeof window === "undefined") return;
  if(typeof window.Chart === "undefined"){
   if(trial < MAX_TRIES){
    window.setTimeout(()=>start(trial+1),50);
   }
   return;
  }
  renderCharts();
 }
 if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded",()=>start(0));
 }else{
  start(0);
 }
})();
 </script>`
  : ""

 return `
<!DOCTYPE html>
<html>
<head>
 <meta charset="UTF-8" />
 <title>Dashboard</title>
 <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
 <style>${EXPORT_STYLES}</style>
</head>
<body>
 <div class="export-shell">
  <div
   class="export-dashboard"
   style="width:${canvasWidth}px;height:${canvasHeight}px;"
  >
   ${widgetsHTML}
  </div>
 </div>

 ${chartsSection}

</body>

</html>
`
}

function renderWidgetHTML(widget:any,columns:any[],rows:any[]){

 const left = widget?.position?.x ?? 0
 const top = widget?.position?.y ?? 0
 const width = widget?.size?.width ?? 320
 const height = widget?.size?.height ?? 220
 const zIndex = widget?.zIndex ?? 1
 const frameStyle = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;z-index:${zIndex};`

 switch(widget?.type){
  case "bar":
  case "line":
  case "donut":
   return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="chart-inner">
      <div class="wg-title">${escapeHtml(widget?.title || "Chart")}</div>
      <canvas id="chart-${widget?.id}"></canvas>
     </div>
    </div>
   </div>
   `

  case "kpi":{
   const kpiValue = buildKpiValue(widget, columns, rows)
   const kpiColor = widget?.color ? `color:${widget.color};` : ""
   const kpiFontSize = widget?.fontSize ? `font-size:${widget.fontSize}px;` : ""
   const prefix = escapeHtml(widget?.prefix || "")
   const suffix = escapeHtml(widget?.suffix || "")
   return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="kpi-inner">
      <div class="kpi-val" style="${kpiColor}${kpiFontSize}">${prefix}${kpiValue}${suffix}</div>
      <div class="kpi-label-txt">${escapeHtml(widget?.label || "KPI")}</div>
     </div>
    </div>
   </div>
   `
  }

  case "text":
   return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="text-inner">
      <div class="text-wg-h1">${escapeHtml(widget?.heading || "Heading")}</div>
      <div class="text-wg-p">${escapeHtml(widget?.body || "")}</div>
     </div>
    </div>
   </div>
   `

  case "table":
   return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     ${buildTable(widget,columns,rows)}
    </div>
   </div>
   `

  default:
   return ""
 }
}

function buildKpiValue(widget:any,columns:any[],rows:any[]){

 if(!columns.length || !rows.length) return "--"

 const idx = columns.findIndex((c)=>c?.name===widget?.valueColumn)
 if(idx<0) return "--"

 const nums = rows
  .map((row)=>Number(row?.[idx] ?? 0))
  .filter((n)=>Number.isFinite(n))

 if(!nums.length) return "--"

 const agg = (widget?.aggregation || "SUM").toUpperCase()

 let result: number
 switch(agg){
  case "AVG":
   result = nums.reduce((a,b)=>a+b, 0) / nums.length
   break
  case "COUNT":
   result = nums.length
   break
  case "MIN":
   result = Math.min(...nums)
   break
  case "MAX":
   result = Math.max(...nums)
   break
  default:
   result = nums.reduce((a,b)=>a+b,0)
 }

 const decimals = widget?.decimals ?? 0
 return Number.isFinite(result)
  ? result.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  : "--"
}

function computeHtmlCell(row: any[], columns: any[], col: any): string {
 const fmtN = (n: number) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
 const vals = (col.operands || []).map((op: string) => {
  const idx = columns.findIndex((c: any) => c?.name === op)
  return idx >= 0 ? row[idx] : null
 })
 switch (col.formula) {
  case "add": {
   const nums = vals.map(Number); if (nums.some(isNaN)) return ""
   return fmtN(nums.reduce((a:number,b:number)=>a+b,0))
  }
  case "subtract": { const [a,b]=vals.map(Number); return isNaN(a)||isNaN(b) ? "" : fmtN(a-b) }
  case "multiply": {
   const nums = vals.map(Number); if (nums.some(isNaN)) return ""
   return fmtN(nums.reduce((a:number,b:number)=>a*b,1))
  }
  case "divide": { const [a,b]=vals.map(Number); return isNaN(a)||isNaN(b)||b===0 ? "" : fmtN(a/b) }
  case "percent": { const [a,b]=vals.map(Number); return isNaN(a)||isNaN(b)||b===0 ? "" : fmtN(a/b*100)+"%" }
  case "concat": return vals.map((v:any)=>String(v??"")||" ").join(" ")
  default: return ""
 }
}

function colSumHtml(rows: any[], columns: any[], colName: string): string {
 const fmtN = (n: number) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
 const idx = columns.findIndex((c: any) => c?.name === colName)
 if (idx < 0) return ""
 const nums = rows.map((r: any) => Number(r?.[idx])).filter(n => isFinite(n))
 if (!nums.length) return ""
 const sum = nums.reduce((a:number,b:number)=>a+b,0)
 return fmtN(sum)
}

function buildTable(widget:any, columns:any[], rows:any[]){

 const selectedColumns:string[] = Array.isArray(widget?.columns) ? widget.columns : []
 const computedCols:any[] = Array.isArray(widget?.computedColumns) ? widget.computedColumns : []
 const theme = widget?.theme || "default"
 const showRowNums = !!widget?.showRowNumbers
 const showStats = !!widget?.showStatsRow

 if(!rows.length || (selectedColumns.length + computedCols.length) === 0){
  return `<div class="empty-state">Connect a dataset to render table data.</div>`
 }

 const rnHdr = showRowNums ? `<th style="width:32px;text-align:center">#</th>` : ""
 const header = rnHdr +
  selectedColumns.map((c:string)=>`<th>${escapeHtml(c)}</th>`).join("") +
  computedCols.map((c:any)=>`<th>${escapeHtml(c.name)}</th>`).join("")

 const body = rows.map((row:any, ri:number)=>{
  const rnCell = showRowNums ? `<td style="width:32px;text-align:center;color:#9ca3af">${ri+1}</td>` : ""
  const nativeCells = selectedColumns.map((col:string)=>{
   const idx = columns.findIndex((c:any)=>c?.name===col)
   return `<td>${escapeHtml(idx>-1 ? row?.[idx] : "")}</td>`
  }).join("")
  const computedCells = computedCols.map((col:any)=>`<td>${escapeHtml(computeHtmlCell(row,columns,col))}</td>`).join("")
  return `<tr>${rnCell}${nativeCells}${computedCells}</tr>`
 }).join("")

 const statsRow = showStats ? (()=>{
  const rnCell = showRowNums ? `<td></td>` : ""
  const nativeCells = selectedColumns.map((col:string)=>`<td>${escapeHtml(colSumHtml(rows,columns,col))}</td>`).join("")
  const computedCells = computedCols.map(()=>`<td></td>`).join("")
  return `<tr class="tw-stats-row">${rnCell}${nativeCells}${computedCells}</tr>`
 })() : ""

 return `
 <div class="table-shell tw-${theme}">
  <table class="tw-table">
   <thead><tr>${header}</tr></thead>
   <tbody>${body}${statsRow}</tbody>
  </table>
 </div>
 `
}

function escapeHtml(value:any){

 return String(value ?? "")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;")
  .replace(/'/g,"&#39;")

}
