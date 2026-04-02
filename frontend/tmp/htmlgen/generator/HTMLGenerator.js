"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHTML = buildHTML;
const ChartScriptGenerator_1 = require("./ChartScriptGenerator");
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
}
.export-dashboard{
 position:relative;
 border-radius:8px;
 background:var(--surface);
 box-shadow:0 12px 40px rgba(15,23,42,0.1);
}
.widget{
 position:absolute;
 background:var(--surface);
 border:1px solid var(--border);
 border-radius:8px;
 box-shadow:0 4px 16px rgba(15,23,42,0.08);
 overflow:hidden;
}
.widget-inner{
 width:100%;
 height:100%;
 display:flex;
 flex-direction:column;
}
.chart-inner{
 flex:1;
 display:flex;
 flex-direction:column;
}
.chart-inner canvas{
 flex:1;
}
.wg-title{
 padding:10px 12px;
 font-weight:600;
 font-size:14px;
 border-bottom:1px solid #f0f1f3;
}
.kpi-inner{
 flex:1;
 display:flex;
 flex-direction:column;
 align-items:center;
 justify-content:center;
 gap:8px;
}
.kpi-val{
 font-size:36px;
 font-weight:700;
 color:var(--accent);
}
.kpi-label-txt{
 font-size:14px;
 color:#5a5f66;
 text-transform:uppercase;
 letter-spacing:0.05em;
}
.text-inner{
 padding:16px 20px;
 display:flex;
 flex-direction:column;
 gap:8px;
}
.text-wg-h1{
 font-size:20px;
 font-weight:600;
 color:#1d2433;
}
.text-wg-p{
 font-size:14px;
 color:#5a5f66;
 line-height:1.5;
}
.table-shell{
 width:100%;
 height:100%;
 padding:12px 16px;
}
.table-widget{
 width:100%;
 border-collapse:collapse;
 font-size:13px;
}
.table-widget th{
 background:#f5f7fb;
 font-weight:600;
}
.table-widget th,
.table-widget td{
 text-align:left;
 padding:8px 10px;
 border-bottom:1px solid var(--border);
}
.empty-state{
 flex:1;
 display:flex;
 align-items:center;
 justify-content:center;
 color:#a3a9b6;
 font-size:14px;
}
`;
function buildHTML(dashboard) {
    var _a, _b, _c, _d, _e;
    const dataset = (_a = dashboard === null || dashboard === void 0 ? void 0 : dashboard.dataset) !== null && _a !== void 0 ? _a : null;
    const datasetColumns = Array.isArray(dataset === null || dataset === void 0 ? void 0 : dataset.columns) ? dataset.columns : [];
    const datasetRows = Array.isArray(dataset === null || dataset === void 0 ? void 0 : dataset.rows) ? dataset.rows : [];
    const widgets = Array.isArray(dashboard === null || dashboard === void 0 ? void 0 : dashboard.widgets) ? dashboard.widgets : [];
    const canvasWidth = (_c = (_b = dashboard === null || dashboard === void 0 ? void 0 : dashboard.canvas) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : 1200;
    const canvasHeight = (_e = (_d = dashboard === null || dashboard === void 0 ? void 0 : dashboard.canvas) === null || _d === void 0 ? void 0 : _d.height) !== null && _e !== void 0 ? _e : 800;
    const widgetsHTML = widgets
        .map((w) => renderWidgetHTML(w, datasetColumns, datasetRows))
        .join("");
    const chartBlocks = widgets
        .map((w) => { var _a; return (0, ChartScriptGenerator_1.buildChartScript)(w, (_a = dashboard === null || dashboard === void 0 ? void 0 : dashboard.dataset) !== null && _a !== void 0 ? _a : null); })
        .filter(Boolean);
    const chartsSection = chartBlocks.length
        ? `<script>
 document.addEventListener("DOMContentLoaded", function(){
${chartBlocks.join("\n")}
 });
 </script>`
        : "";
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
`;
}
function renderWidgetHTML(widget, columns, rows) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const left = (_b = (_a = widget === null || widget === void 0 ? void 0 : widget.position) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0;
    const top = (_d = (_c = widget === null || widget === void 0 ? void 0 : widget.position) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0;
    const width = (_f = (_e = widget === null || widget === void 0 ? void 0 : widget.size) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 320;
    const height = (_h = (_g = widget === null || widget === void 0 ? void 0 : widget.size) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 220;
    const zIndex = (_j = widget === null || widget === void 0 ? void 0 : widget.zIndex) !== null && _j !== void 0 ? _j : 1;
    const frameStyle = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;z-index:${zIndex};`;
    switch (widget === null || widget === void 0 ? void 0 : widget.type) {
        case "bar":
        case "line":
        case "donut":
            return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="chart-inner">
      <div class="wg-title">${escapeHtml((widget === null || widget === void 0 ? void 0 : widget.title) || "Chart")}</div>
      <canvas id="chart-${widget === null || widget === void 0 ? void 0 : widget.id}"></canvas>
     </div>
    </div>
   </div>
   `;
        case "kpi":
            return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="kpi-inner">
      <div class="kpi-val">${buildKpiValue(widget, columns, rows)}</div>
      <div class="kpi-label-txt">${escapeHtml((widget === null || widget === void 0 ? void 0 : widget.label) || "KPI")}</div>
     </div>
    </div>
   </div>
   `;
        case "text":
            return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="text-inner">
      <div class="text-wg-h1">${escapeHtml((widget === null || widget === void 0 ? void 0 : widget.heading) || "Heading")}</div>
      <div class="text-wg-p">${escapeHtml((widget === null || widget === void 0 ? void 0 : widget.body) || "")}</div>
     </div>
    </div>
   </div>
   `;
        case "table":
            return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     ${buildTable(widget, columns, rows)}
    </div>
   </div>
   `;
        default:
            return "";
    }
}
function buildKpiValue(widget, columns, rows) {
    if (!columns.length || !rows.length)
        return "--";
    const idx = columns.findIndex((c) => (c === null || c === void 0 ? void 0 : c.name) === (widget === null || widget === void 0 ? void 0 : widget.valueColumn));
    if (idx < 0)
        return "--";
    const total = rows.reduce((sum, row) => {
        var _a;
        const value = Number((_a = row === null || row === void 0 ? void 0 : row[idx]) !== null && _a !== void 0 ? _a : 0);
        return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    return Number.isFinite(total) ? total.toLocaleString() : "--";
}
function buildTable(widget, columns, rows) {
    const selectedColumns = Array.isArray(widget === null || widget === void 0 ? void 0 : widget.columns) ? widget.columns : [];
    if (!rows.length || !selectedColumns.length) {
        return `<div class="empty-state">Connect a dataset to render table data.</div>`;
    }
    const header = selectedColumns
        .map((column) => `<th>${escapeHtml(column)}</th>`)
        .join("");
    const body = rows
        .map((row) => {
        const cells = selectedColumns
            .map((column) => {
            const idx = columns.findIndex((c) => (c === null || c === void 0 ? void 0 : c.name) === column);
            const value = idx > -1 ? row === null || row === void 0 ? void 0 : row[idx] : "";
            return `<td>${escapeHtml(value)}</td>`;
        })
            .join("");
        return `<tr>${cells}</tr>`;
    })
        .join("");
    return `
 <div class="table-shell">
  <table class="table-widget">
   <thead>
    <tr>${header}</tr>
   </thead>
   <tbody>
    ${body}
   </tbody>
  </table>
 </div>
 `;
}
function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
