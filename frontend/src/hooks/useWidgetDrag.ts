import { useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import type { Widget } from "../types/widgetTypes"
import { snap, snapToEdges } from "../utils/snapGrid"

export function useWidgetDrag(widget: Widget) {

  const updateWidget   = useDashboardStore((s) => s.updateWidget)
  const updateWidgets  = useDashboardStore((s) => s.updateWidgets)
  const deleteWidget   = useDashboardStore((s) => s.deleteWidget)
  const deleteSelected = useDashboardStore((s) => s.deleteSelected)
  const beginDrag      = useDashboardStore((s) => s.beginDrag)
  const setGuideLines  = useDashboardStore((s) => s.setGuideLines)
  const zoom           = useDashboardStore((s) => s.zoom)

  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null)

  function startDrag(e: React.MouseEvent) {
    if (e.button !== 0) return  // left button only
    e.stopPropagation()
    beginDrag()

    const startX = e.clientX
    const startY = e.clientY
    const scale  = zoom / 100

    document.dispatchEvent(new CustomEvent("widget-drag-start"))

    const state   = useDashboardStore.getState()
    const isMulti = state.selectedWidgetIds.length > 1 && state.selectedWidgetIds.includes(widget.id)

    const starts = isMulti
      ? state.dashboard.widgets
          .filter(w => state.selectedWidgetIds.includes(w.id))
          .map(w => ({ ...w }))
      : [{ ...widget }]

    function onMove(ev: MouseEvent) {
      setGhostPos({ x: ev.clientX, y: ev.clientY })

      const dx = (ev.clientX - startX) / scale
      const dy = (ev.clientY - startY) / scale

      if (isMulti) {
        const updated = starts.map(s => ({
          ...s,
          position: {
            x: snap(Math.max(0, s.position.x + dx)),
            y: snap(Math.max(0, s.position.y + dy))
          }
        }))
        updateWidgets(updated)
      } else {
        const allWidgets = useDashboardStore.getState().dashboard.widgets
        const others = allWidgets
          .filter(w => w.id !== widget.id)
          .map(w => ({ x: w.position.x, y: w.position.y, w: w.size.width, h: w.size.height }))

        const raw = {
          x: starts[0].position.x + dx,
          y: starts[0].position.y + dy,
          w: widget.size.width,
          h: widget.size.height
        }

        const result = snapToEdges(raw, others)
        setGuideLines(result.guides)
        updateWidget({
          ...widget,
          position: { x: Math.max(0, result.x), y: Math.max(0, result.y) }
        })
      }
    }

    function onUp(ev: MouseEvent) {
      setGhostPos(null)
      setGuideLines({ vertical: [], horizontal: [] })
      document.dispatchEvent(new CustomEvent("widget-drag-end"))
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup",   onUp)

      const trashEl = document.getElementById("trash-zone")
      if (trashEl) {
        const r = trashEl.getBoundingClientRect()
        if (ev.clientX >= r.left && ev.clientX <= r.right &&
            ev.clientY >= r.top  && ev.clientY <= r.bottom) {
          if (isMulti) deleteSelected()
          else deleteWidget(widget.id)
        }
      }
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup",   onUp)
  }

  return { ghostPos, startDrag }
}
