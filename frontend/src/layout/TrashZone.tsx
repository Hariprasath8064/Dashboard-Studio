import { useRef, useState, useEffect } from "react"
import { useDashboardStore } from "../store/dashboardStore"

const PROXIMITY_RADIUS = 120

export default function TrashZone(){

 const [active,     setActive]     = useState(false)
 const [listening,  setListening]  = useState(false)
 const binRef = useRef<HTMLDivElement | null>(null)

 // Listen for drag-start / drag-end events dispatched by CanvasWidget
 useEffect(() => {

  function onDragStart() { setListening(true) }
  function onDragEnd()   { setListening(false); setActive(false) }

  document.addEventListener("widget-drag-start", onDragStart)
  document.addEventListener("widget-drag-end",   onDragEnd)
  return () => {
   document.removeEventListener("widget-drag-start", onDragStart)
   document.removeEventListener("widget-drag-end",   onDragEnd)
  }

 }, [])

 // While a widget is being dragged, track cursor proximity
 useEffect(() => {

  if (!listening) return

  function onMove(e: MouseEvent) {
   const rect = binRef.current?.getBoundingClientRect()
   if (!rect) return
   const cx = rect.left + rect.width  / 2
   const cy = rect.top  + rect.height / 2
   setActive(Math.hypot(e.clientX - cx, e.clientY - cy) < PROXIMITY_RADIUS)
  }

  document.addEventListener("mousemove", onMove)
  return () => document.removeEventListener("mousemove", onMove)

 }, [listening])

 return(

  <div
   id="trash-zone"
   ref={binRef}
   className={`trash-orb${active ? " active" : ""}${listening ? " visible" : ""}`}
   role="button"
   aria-label="Delete widget"
   title="Drop a widget here to delete"
  >
   <div className="trash-glow" aria-hidden="true"></div>
   <div className="trash-bin" aria-hidden="true">
    <div className="trash-lid">
     <span className="trash-hinge"></span>
    </div>
    <div className="trash-body">
     <span className="trash-body-bar"></span>
     <span className="trash-body-bar"></span>
     <span className="trash-body-bar"></span>
    </div>
   </div>
  </div>

 )

}
