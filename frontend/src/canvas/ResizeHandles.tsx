import type { Widget } from "../types/widgetTypes"
import { useDashboardStore } from "../store/dashboardStore"

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

interface Props {
  widget: Widget
}

export default function ResizeHandles({ widget }: Props) {

  const updateWidget = useDashboardStore((s) => s.updateWidget)
  const beginDrag    = useDashboardStore((s) => s.beginDrag)

  function startResize(e: React.MouseEvent, handle: Handle) {

    e.stopPropagation()
    e.preventDefault()
    beginDrag()   // push history once before resize begins

    const startX = e.clientX
    const startY = e.clientY

    const { x: origX, y: origY } = widget.position
    const { width: origW, height: origH } = widget.size

    function onMove(ev: MouseEvent) {

      const dx = ev.clientX - startX
      const dy = ev.clientY - startY

      let newX = origX
      let newY = origY
      let newW = origW
      let newH = origH

      // Horizontal
      if (handle === "e" || handle === "se" || handle === "ne") {
        newW = Math.max(80, origW + dx)
      }
      if (handle === "w" || handle === "sw" || handle === "nw") {
        const candidate = Math.max(80, origW - dx)
        newX = origX + (origW - candidate)
        newW = candidate
      }

      // Vertical
      if (handle === "s" || handle === "se" || handle === "sw") {
        newH = Math.max(60, origH + dy)
      }
      if (handle === "n" || handle === "ne" || handle === "nw") {
        const candidate = Math.max(60, origH - dy)
        newY = origY + (origH - candidate)
        newH = candidate
      }

      updateWidget({
        ...widget,
        position: { x: newX, y: newY },
        size: { width: newW, height: newH }
      })

    }

    function onUp() {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)

  }

  const handles: Handle[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"]

  return (
    <>
      {handles.map(h => (
        <div
          key={h}
          className={`resize-handle resize-${h}`}
          onMouseDown={(e) => startResize(e, h)}
        />
      ))}
    </>
  )

}