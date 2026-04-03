import { useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"

import ChartProperties from "../properties/ChartProperties"
import TextProperties  from "../properties/TextProperties"
import TableProperties from "../properties/TableProperties"
import KPIProperties   from "../properties/KPIProperties"

import StylePanel  from "../properties/panels/StylePanel"
import LayoutPanel from "../properties/panels/LayoutPanel"
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
 donut: "Donut Chart",
 pie: "Pie Chart",
 gauge: "Gauge",
 histogram: "Histogram",
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

export default function PropertiesPanel(){

 const widgets    = useDashboardStore(s => s.dashboard.widgets)
 const selectedId = useDashboardStore(s => s.selectedWidgetId)

 const widget = widgets.find(w => w.id === selectedId)

 const [tab, setTab] = useState("data")

 if(!widget){
  return(
   <div id="props-panel">
    <div className="pp-header">Canvas</div>
    <CanvasProperties />
   </div>
  )
 }

 const isTextWidget  = (w: Widget): w is TextWidget  => w.type === "text"
 const isTableWidget = (w: Widget): w is TableWidget => w.type === "table"
 const isKPIWidget   = (w: Widget): w is KPIWidget   => w.type === "kpi"
 const isChartWidget = (w: Widget): w is ChartWidget =>
  w.type === "bar" || w.type === "line" || w.type === "donut" ||
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

  </div>
 )
}

