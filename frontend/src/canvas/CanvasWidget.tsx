import { useState } from "react"
import { createPortal } from "react-dom"
import { useDashboardStore } from "../store/dashboardStore"
import type { Widget } from "../types/widgetTypes"
import ResizeHandles from "./ResizeHandles"

import BarChartWidget  from "../widgets/BarChart/BarChartWidget"
import LineChartWidget from "../widgets/LineChart/LineChartWidget"
import DonutWidget     from "../widgets/DonutChart/DonutWidget"
import PieChartWidget  from "../widgets/PieChart/PieChartWidget"
import GaugeWidget     from "../widgets/GaugeWidget/GaugeWidget"
import TimelineWidget  from "../widgets/Timeline/TimelineWidget"
import AreaChartWidget  from "../widgets/AreaChart/AreaChartWidget"
import ScatterChartWidget from "../widgets/ScatterChart/ScatterChartWidget"
import StackedBarWidget from "../widgets/StackedBar/StackedBarWidget"
import RadarChartWidget  from "../widgets/RadarChart/RadarChartWidget"
import KPIWidget       from "../widgets/KPIWidget/KPIWidget"
import TableWidget     from "../widgets/TableWidget/TableWidget"
import TextWidget      from "../widgets/TextWidget/TextWidget"
import { snap, snapToEdges } from "../utils/snapGrid"

const TYPE_ICON: Record<string, string> = {
  bar: "▤", line: "↗", area: "△", "stacked-bar": "▦", scatter: "∷", radar: "☆",
  donut: "◎", pie: "◔", gauge: "◑", timeline: "≡",
  kpi: "#", table: "⊞", text: "T"
}

interface Props {
  widget: Widget
}

export default function CanvasWidget({ widget }: Props) {

  const selectWidget      = useDashboardStore((s) => s.selectWidget)
  const addToSelection    = useDashboardStore((s) => s.addToSelection)
  const selectedWidgetIds = useDashboardStore((s) => s.selectedWidgetIds)
  const updateWidget      = useDashboardStore((s) => s.updateWidget)
  const updateWidgets     = useDashboardStore((s) => s.updateWidgets)
  const deleteWidget      = useDashboardStore((s) => s.deleteWidget)
  const deleteSelected    = useDashboardStore((s) => s.deleteSelected)
  const beginDrag         = useDashboardStore((s) => s.beginDrag)
  const setGuideLines     = useDashboardStore((s) => s.setGuideLines)
  const zoom              = useDashboardStore((s) => s.zoom)

  const selected = selectedWidgetIds.includes(widget.id)

  // Ghost state — cursor position while dragging
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null)

  function startDrag(e: React.MouseEvent) {

    if (e.button !== 0) return   // left button only
    e.stopPropagation()
    beginDrag()

    const startX = e.clientX
    const startY = e.clientY
    const scale  = zoom / 100

    // Tell TrashZone a drag has started
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

      // If released over trash zone → delete
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

  function onDrop(e: React.DragEvent) {
    e.stopPropagation()  // prevent canvas from also creating a new widget
    e.preventDefault()
    const column  = e.dataTransfer.getData("dataset-column")
    const colType = e.dataTransfer.getData("dataset-column-type")
    if (!column) return

    if (widget.type === "bar" || widget.type === "line" || widget.type === "donut" ||
        widget.type === "area" || widget.type === "stacked-bar" || widget.type === "scatter" ||
        widget.type === "radar" ||
        widget.type === "pie" || widget.type === "gauge" || widget.type === "timeline") {
      const chart = widget as any
      // numerics → Y axis, dimensions/dates → X axis
      if (colType === "number") {
        updateWidget({ ...chart, query: { ...chart.query, yColumn: column } })
      } else {
        updateWidget({ ...chart, query: { ...chart.query, xColumn: column } })
      }
    } else if (widget.type === "table") {
      const tbl = widget as any
      if (!tbl.columns.includes(column)) {
        updateWidget({ ...tbl, columns: [...tbl.columns, column] })
      }
    } else if (widget.type === "kpi") {
      if (colType === "number") {
        const kpi = widget as any
        updateWidget({ ...kpi, valueColumn: column, label: kpi.label || column })
      }
    }
  }

  function renderWidget(w: Widget) {
    switch (w.type) {
      case "bar":       return <BarChartWidget  widget={w as any} />
      case "line":      return <LineChartWidget widget={w as any} />
      case "area":      return <AreaChartWidget  widget={w as any} />
      case "stacked-bar": return <StackedBarWidget widget={w as any} />
      case "scatter":   return <ScatterChartWidget widget={w as any} />
      case "radar":     return <RadarChartWidget   widget={w as any} />
      case "donut":     return <DonutWidget     widget={w as any} />
      case "pie":       return <PieChartWidget  widget={w as any} />
      case "gauge":     return <GaugeWidget     widget={w as any} />
      case "timeline":  return <TimelineWidget  widget={w as any} />
      case "kpi":       return <KPIWidget       widget={w as any} />
      case "table":     return <TableWidget     widget={w as any} />
      case "text":      return <TextWidget      widget={w as any} />
      default:          return null
    }
  }

  const ghostLabel = (widget as any).title
    || (widget as any).label
    || (widget as any).heading
    || widget.type

  return (
    <>
      <div
        className={`widget${selected ? " selected" : ""}${ghostPos ? " is-dragging" : ""}`}
        style={{
          left:   widget.position.x,
          top:    widget.position.y,
          width:  widget.size.width,
          height: widget.size.height,
          zIndex: widget.zIndex
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={(e) => {
          e.stopPropagation()
          if (e.shiftKey) addToSelection(widget.id)
          else selectWidget(widget.id)
        }}
      >

        <div
          className="widget-drag-area"
          onMouseDown={startDrag}
        />

        <div className="widget-inner">
          {renderWidget(widget)}
        </div>

        {selected && selectedWidgetIds.length === 1 && <ResizeHandles widget={widget} />}

      </div>

      {/* Ghost pill that follows the cursor while dragging */}
      {ghostPos && createPortal(
        <div
          className="widget-drag-ghost"
          style={{ left: ghostPos.x, top: ghostPos.y }}
        >
          <span className="wdg-icon">{TYPE_ICON[widget.type] || "□"}</span>
          <span className="wdg-label">{ghostLabel}</span>
        </div>,
        document.body
      )}
    </>
  )

}
