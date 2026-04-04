import { useEffect, useMemo, useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"

import ChartProperties from "../properties/ChartProperties"
import TextProperties  from "../properties/TextProperties"
import TableProperties from "../properties/TableProperties"
import KPIProperties   from "../properties/KPIProperties"

import StylePanel  from "../properties/panels/StylePanel"
import LayoutPanel from "../properties/panels/LayoutPanel"
import DatasetFields from "../sidebar/DatasetFields"
import type {
 Widget,
 TextWidget,
 TableWidget,
 KPIWidget,
 ChartWidget
} from "../types/widgetTypes"

const TYPE_LABELS: Record<string, string> = {
 bar: "Bar Chart",
 line: "Line Chart",
 area: "Area Chart",
 "stacked-bar": "Stacked Bar",
 scatter: "Scatter",
 radar: "Radar",
 donut: "Donut Chart",
 pie: "Pie Chart",
 gauge: "Gauge",
 timeline: "Timeline",
 kpi: "KPI Card",
 table: "Table",
 text: "Text"
}

const BG_PRESETS = ["#ffffff","#f4f6f9","#f0f4ff","#f0fff4","#fff7f0","#fdf4ff","#1b2230","#0f172a"]

function CanvasProperties() {

 const canvas      = useDashboardStore(s => s.dashboard.canvas)
 const background  = useDashboardStore(s => s.dashboard.background)
 const updateCanvas = useDashboardStore(s => s.updateCanvas)
 const setCanvasBg  = useDashboardStore(s => s.setCanvasBg)

 const bgColor = background?.color || "#f4f6f9"

 return (
  <div className="pp-scroll">

   <div className="pp-group">
    <div className="pp-group-label">Dimensions</div>

    <div className="pp-row">
     <span className="pp-label">Width</span>
     <input
      className="pp-input"
      type="number"
      min={400} max={3000} step={10}
      value={canvas.width}
      onChange={e => updateCanvas({ width: Math.max(400, Number(e.target.value)) })}
     />
    </div>

    <div className="pp-row">
     <span className="pp-label">Height</span>
     <input
      className="pp-input"
      type="number"
      min={300} max={3000} step={10}
      value={canvas.height}
      onChange={e => updateCanvas({ height: Math.max(300, Number(e.target.value)) })}
     />
    </div>
   </div>

   <div className="pp-group">
    <div className="pp-group-label">Background</div>

    <div className="pp-row">
     <span className="pp-label">Color</span>
     <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
      <div className="canvas-bg-swatch" style={{ background: bgColor }}>
       <input
        type="color"
        value={bgColor}
        onChange={e => setCanvasBg({ color: e.target.value, image: "" })}
       />
      </div>
      <input
       className="pp-input"
       value={bgColor}
       onChange={e => setCanvasBg({ color: e.target.value })}
       style={{ flex:1, fontFamily:"var(--mono)", fontSize:11 }}
       maxLength={7}
      />
     </div>
    </div>

    <div style={{ display:"flex", flexWrap:"wrap", gap:5, padding:"4px 0 8px 0" }}>
     {BG_PRESETS.map(c => (
      <div
       key={c}
       className={`pp-swatch${bgColor === c ? " sel" : ""}`}
       style={{ background: c, border: c === "#ffffff" ? "1px solid var(--border)" : undefined }}
       title={c}
       onClick={() => setCanvasBg({ color: c, image: "" })}
      />
     ))}
    </div>

   </div>

  </div>
 )
}

function FieldsContent() {

 const dataset     = useDashboardStore((s) => s.dashboard.dataset)
 const datasetName = useDashboardStore((s) => s.datasetName)
 const [search, setSearch] = useState("")

 const stats = useMemo(() => {
  if (!dataset) return null
  const dims    = dataset.columns.filter((c) => c.type !== "number").length
  const metrics = dataset.columns.filter((c) => c.type === "number").length
  return { total: dataset.columns.length, rows: dataset.rows.length, dims, metrics }
 }, [dataset])

 if (!dataset || !stats) {
  return (
   <div className="pp-scroll">
    <div className="fp-empty">
     <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 11h20" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10 6v5M18 6v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
     </svg>
     <span>Load a dataset in the<br/>Data tab to see fields</span>
    </div>
   </div>
  )
 }

 return (
  <div className="pp-scroll">
   <div style={{ padding: "10px 14px 0" }}>

    <div className="fp-dataset-card">
     <div className="fp-dataset-name" title={datasetName || ""}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
       <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
       <path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/>
       <path d="M4 2v3M8 2v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      {datasetName || "Dataset"}
     </div>
     <div className="fp-stat-row">
      <span className="fp-stat"><b>{stats.rows}</b> rows</span>
      <span className="fp-stat-sep">·</span>
      <span className="fp-stat fp-stat-dim"><b>{stats.dims}</b> dim</span>
      <span className="fp-stat-sep">·</span>
      <span className="fp-stat fp-stat-metric"><b>{stats.metrics}</b> metric</span>
     </div>
    </div>

    <div className="fp-search-wrap">
     <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="fp-search-icon">
      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
     </svg>
     <input
      className="fp-search"
      placeholder="Search fields…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
     />
     {search && (
      <button className="fp-search-clear" onClick={() => setSearch("")}>×</button>
     )}
    </div>

    <div className="fp-hint">Drag a field onto the canvas or a widget</div>
   </div>

   <div style={{ padding: "0 14px 12px" }}>
    <DatasetFields search={search} />
   </div>
  </div>
 )
}

export default function PropertiesPanel(){

 const widgets    = useDashboardStore(s => s.dashboard.widgets)
 const selectedId = useDashboardStore(s => s.selectedWidgetId)

 const widget = widgets.find(w => w.id === selectedId)

 const [tab, setTab]   = useState("data")
 const [view, setView] = useState<"properties"|"fields">("fields")

 // Auto-switch: show Properties when a widget is selected, Fields when deselected
 useEffect(() => {
  setView(selectedId ? "properties" : "fields")
 }, [selectedId])

 const isTextWidget  = (w: Widget): w is TextWidget  => w.type === "text"
 const isTableWidget = (w: Widget): w is TableWidget => w.type === "table"
 const isKPIWidget   = (w: Widget): w is KPIWidget   => w.type === "kpi"
 const isChartWidget = (w: Widget): w is ChartWidget =>
  w.type === "bar" || w.type === "line" || w.type === "donut" ||
  w.type === "area" || w.type === "stacked-bar" || w.type === "scatter" ||
  w.type === "radar" ||
  w.type === "pie" || w.type === "gauge" || w.type === "timeline"

 function renderDataPanel(widget: Widget){
  if(isTextWidget(widget))  return <TextProperties  widget={widget} />
  if(isTableWidget(widget)) return <TableProperties widget={widget} />
  if(isKPIWidget(widget))   return <KPIProperties   widget={widget} />
  if(isChartWidget(widget)) return <ChartProperties widget={widget} />
  return null
 }

 return(
  <div id="props-panel">

   {/* Top-level view switcher */}
   <div className="rp-view-tabs">
    <button className={view==="fields"     ? "active" : ""} onClick={()=>setView("fields")}>Fields</button>
    <button className={view==="properties" ? "active" : ""} onClick={()=>setView("properties")}>Properties</button>
   </div>

   {/* ── Fields view ── */}
   {view==="fields" && <FieldsContent />}

   {/* ── Properties view ── */}
   {view==="properties" && (
    <>
     {!widget ? (
      <>
       <div className="pp-header">Canvas</div>
       <CanvasProperties />
      </>
     ) : (
      <>
       <div className="pp-header">
        Properties
        <span className="pp-badge">{TYPE_LABELS[widget.type] || widget.type}</span>
       </div>

       <div className="props-tabs">
        <button className={tab==="data"   ? "active":""} onClick={()=>setTab("data")}>Data</button>
        <button className={tab==="style"  ? "active":""} onClick={()=>setTab("style")}>Style</button>
        <button className={tab==="layout" ? "active":""} onClick={()=>setTab("layout")}>Layout</button>
       </div>

       <div className="pp-scroll">
        {tab==="data"   && renderDataPanel(widget)}
        {tab==="style"  && <StylePanel  widget={widget} />}
        {tab==="layout" && <LayoutPanel widget={widget} />}
       </div>
      </>
     )}
    </>
   )}

  </div>
 )
}

