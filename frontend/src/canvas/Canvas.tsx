import { useRef } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import CanvasWidget from "./CanvasWidget"
import CanvasGrid from "./CanvasGrid"
import SmartGuides from "./SmartGuides"
import { generateId } from "../utils/id"

export default function Canvas(){

 const widgets    = useDashboardStore((s) => s.dashboard.widgets)
 const canvas     = useDashboardStore((s) => s.dashboard.canvas)
 const background = useDashboardStore((s) => s.dashboard.background)
 const addWidget  = useDashboardStore((s) => s.addWidget)
 const clearSelection = useDashboardStore((s) => s.clearSelection)
 const updateCanvas   = useDashboardStore((s) => s.updateCanvas)
 const zoom       = useDashboardStore((s) => s.zoom)
 const setZoom    = useDashboardStore((s) => s.setZoom)
 const showGrid   = useDashboardStore((s) => s.showGrid)
 const setShowGrid = useDashboardStore((s) => s.setShowGrid)
 const undo       = useDashboardStore((s) => s.undo)
 const redo       = useDashboardStore((s) => s.redo)
 const past       = useDashboardStore((s) => s.past)
 const future     = useDashboardStore((s) => s.future)

 const scrollRef = useRef<HTMLDivElement>(null)

 const dynamicHeight = Math.max(
  canvas.height,
  ...widgets.map(w => w.position.y + w.size.height + 200)
 )

 // Canvas background styles
 const bgStyle: React.CSSProperties = {}
 if (background?.image) {
  bgStyle.backgroundImage  = `url(${background.image})`
  bgStyle.backgroundSize   = "cover"
  bgStyle.backgroundPosition = "center"
 } else {
  bgStyle.backgroundColor = background?.color || "#ffffff"
 }

 function handleDrop(e:React.DragEvent){
  e.preventDefault()
  const type = e.dataTransfer.getData("component-type")
  if(!type) return
  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / (zoom / 100)
  const y = (e.clientY - rect.top)  / (zoom / 100)
  const base = {
   id: generateId("w"),
   type,
   position:{ x, y },
   size:{ width:300, height:200 },
   zIndex: Date.now()
  }
  if(type==="text"){
   addWidget({ ...base, heading:"Text Widget", body:"Edit this text" } as any)
   return
  }
  if(type==="kpi"){
   addWidget({ ...base, label:"KPI", valueColumn:"", aggregation:"SUM" } as any)
   return
  }
  if(type==="table"){
   addWidget({ ...base, columns:[] } as any)
   return
  }
  addWidget({ ...base, title:"Chart", color:"#2b7cff", query:{ xColumn:"", yColumn:"", aggregation:"SUM" } } as any)
 }

 const ZOOM_STEP = 10
 const MIN_ZOOM  = 25
 const MAX_ZOOM  = 200

 function fitToScreen() {
  if (!scrollRef.current) return
  const { clientWidth, clientHeight } = scrollRef.current
  const padding = 64
  const fitZoomW = Math.floor(((clientWidth  - padding) / canvas.width)  * 100)
  const fitZoomH = Math.floor(((clientHeight - padding) / dynamicHeight) * 100)
  setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(fitZoomW, fitZoomH))))
 }

 // ── Canvas edge resize handlers ──

 function startResizeE(e: React.MouseEvent) {
  e.stopPropagation(); e.preventDefault()
  const startX = e.clientX; const origW = canvas.width
  const onMove = (ev: MouseEvent) => updateCanvas({ width:  Math.max(400, Math.round(origW + (ev.clientX - startX) / (zoom / 100))) })
  const onUp   = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp) }
  document.addEventListener("mousemove", onMove)
  document.addEventListener("mouseup",   onUp)
 }

 function startResizeS(e: React.MouseEvent) {
  e.stopPropagation(); e.preventDefault()
  const startY = e.clientY; const origH = canvas.height
  const onMove = (ev: MouseEvent) => updateCanvas({ height: Math.max(300, Math.round(origH + (ev.clientY - startY) / (zoom / 100))) })
  const onUp   = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp) }
  document.addEventListener("mousemove", onMove)
  document.addEventListener("mouseup",   onUp)
 }

 function startResizeSE(e: React.MouseEvent) {
  e.stopPropagation(); e.preventDefault()
  const startX = e.clientX; const startY = e.clientY
  const origW = canvas.width; const origH = canvas.height
  const onMove = (ev: MouseEvent) => {
   const scale = zoom / 100
   updateCanvas({
    width:  Math.max(400, Math.round(origW + (ev.clientX - startX) / scale)),
    height: Math.max(300, Math.round(origH + (ev.clientY - startY) / scale))
   })
  }
  const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp) }
  document.addEventListener("mousemove", onMove)
  document.addEventListener("mouseup",   onUp)
 }

 return(

  <div id="canvas-area">

   <div id="canvas-toolbar">

    <button
     className={`ct-btn${showGrid ? " active" : ""}`}
     onClick={() => setShowGrid(!showGrid)}
     title="Toggle grid"
    >
     <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4.5 1v11M8.5 1v11M1 4.5h11M1 8.5h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
     </svg>
     Grid
    </button>

    <div className="ct-div"/>

    <button className="ct-btn ct-icon" onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">
     <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 5.5 5 2.5M2 5.5 5 8.5M2 5.5h7a2.5 2.5 0 010 5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
    </button>

    <button className="ct-btn ct-icon" onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)">
     <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M12 5.5 9 2.5M12 5.5 9 8.5M12 5.5H5a2.5 2.5 0 000 5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
    </button>

    <div className="ct-div"/>

    <button
     className="ct-btn ct-icon"
     onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}
     title="Zoom out"
     disabled={zoom <= MIN_ZOOM}
    >
     <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    </button>

    <span className="ct-zoom-label">{zoom}%</span>

    <button
     className="ct-btn ct-icon"
     onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}
     title="Zoom in"
     disabled={zoom >= MAX_ZOOM}
    >
     <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 3v7M3 6.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    </button>

    <button
     className="ct-btn ct-icon"
     onClick={() => setZoom(100)}
     title="Reset zoom"
     style={{ fontSize: 10, padding: "3px 7px" }}
    >
     Reset
    </button>

    <button
     className="ct-btn"
     onClick={fitToScreen}
     title="Fit canvas to screen"
     style={{ fontSize: 10 }}
    >
     <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 5V2h3M9 2h3v3M12 8v3H9M4 12H1V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
     </svg>
     Fit
    </button>

   </div>

   <div id="canvas-scroll" ref={scrollRef}>

    {/* Wrapper keeps resize handles outside the CSS transform */}
    <div style={{ position: "relative", display: "inline-block" }}>

     <div
      id="canvas-frame"
      style={{
       width: canvas.width,
       height: dynamicHeight,
       transform: `scale(${zoom / 100})`,
       transformOrigin: "top left",
       ...bgStyle
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => clearSelection()}
     >

      <CanvasGrid show={showGrid}/>

      {widgets.map(w => (
       <CanvasWidget key={w.id} widget={w}/>
      ))}

      <SmartGuides />

     </div>

     {/* Canvas resize handles – sit at visual edge of scaled frame */}
     <div
      className="canvas-resize-e"
      style={{ height: dynamicHeight * (zoom / 100) }}
      onMouseDown={startResizeE}
     />
     <div
      className="canvas-resize-s"
      style={{ width: canvas.width * (zoom / 100) }}
      onMouseDown={startResizeS}
     />
     <div
      className="canvas-resize-se"
      style={{ top: dynamicHeight * (zoom / 100) - 6, left: canvas.width * (zoom / 100) - 6 }}
      onMouseDown={startResizeSE}
     />

    </div>

   </div>

   <div id="statusbar">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1h4v4H1zM7 1h4v4H7zM1 7h4v4H1zM7 7h4v4H7z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
    <span>{widgets.length} component{widgets.length !== 1 ? 's' : ''}</span>
    <div className="sb-spacer"/>
    <span style={{fontSize:11,color:'var(--text3)'}}>{canvas.width} × {canvas.height} px</span>
   </div>

  </div>

 )

}

