import { buildChartScript } from "./ChartScriptGenerator"
import { EXPORT_STYLES }   from "./export/exportStyles"
import { renderWidgetHTML } from "./export/widgetHTML"

export function buildHTML(dashboard: any) {

  const dataset        = dashboard?.dataset ?? null
  const datasetColumns = Array.isArray(dataset?.columns) ? dataset.columns : []
  const datasetRows    = Array.isArray(dataset?.rows)    ? dataset.rows    : []
  const widgets        = Array.isArray(dashboard?.widgets) ? dashboard.widgets : []
  const canvasWidth    = dashboard?.canvas?.width ?? 1200
  const canvasHeight   = Math.max(
    dashboard?.canvas?.height ?? 800,
    ...widgets.map((w: any) => w.position.y + w.size.height + 40)
  )

  const widgetsHTML = widgets
    .map((w: any) => renderWidgetHTML(w, datasetColumns, datasetRows))
    .join("")

  const chartBlocks = widgets
    .map((w: any) => buildChartScript(w, dashboard?.dataset ?? null))
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
