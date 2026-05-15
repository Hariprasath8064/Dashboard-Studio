import { useState, useEffect } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { generateId } from "../utils/id"

interface FieldGhost {
  x: number
  y: number
  kind: "kpi" | "table" | "chart"
}

export function useCanvasDrop(zoom: number) {

  const addWidget = useDashboardStore((s) => s.addWidget)

  const [fieldGhost, setFieldGhost] = useState<FieldGhost | null>(null)

  // Clear ghost whenever any drag ends (covers drop-on-widget case where
  // stopPropagation prevents the canvas onDrop from running)
  useEffect(() => {
    const clear = () => setFieldGhost(null)
    document.addEventListener("dragend", clear)
    return () => document.removeEventListener("dragend", clear)
  }, [])

  function handleFieldDragOver(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes("dataset-column")) return
    e.preventDefault()
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) / (zoom / 100))
    const y = Math.round((e.clientY - rect.top)  / (zoom / 100))
    setFieldGhost((prev) =>
      prev?.x === x && prev?.y === y ? prev : { x, y, kind: "table" }
    )
  }

  function handleFieldDragLeave(e: React.DragEvent) {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setFieldGhost(null)
    }
  }

  function dropFieldOnCanvas(colName: string, colType: string, x: number, y: number) {
    const id     = generateId("w")
    const zIndex = Date.now()
    if (colType === "number") {
      addWidget({
        id, type: "kpi",
        position: { x, y },
        size: { width: 200, height: 110 },
        zIndex,
        label: colName,
        valueColumn: colName,
        aggregation: "SUM"
      } as any)
    } else {
      addWidget({
        id, type: "table",
        position: { x, y },
        size: { width: 320, height: 240 },
        zIndex,
        columns: [colName]
      } as any)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setFieldGhost(null)

    const rect    = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x       = (e.clientX - rect.left) / (zoom / 100)
    const y       = (e.clientY - rect.top)  / (zoom / 100)

    const colName = e.dataTransfer.getData("dataset-column")
    const colType = e.dataTransfer.getData("dataset-column-type")
    if (colName) {
      dropFieldOnCanvas(colName, colType, x, y)
      return
    }

    const type = e.dataTransfer.getData("component-type")
    if (!type) return
    const base = {
      id: generateId("w"),
      type,
      position: { x, y },
      size: { width: 300, height: 200 },
      zIndex: Date.now()
    }
    if (type === "text")  { addWidget({ ...base, heading: "Text Widget", body: "Edit this text" } as any); return }
    if (type === "kpi")   { addWidget({ ...base, label: "KPI", valueColumn: "", aggregation: "SUM" } as any); return }
    if (type === "table") { addWidget({ ...base, columns: [] } as any); return }
    if (type === "image") { addWidget({ ...base, size: { width: 320, height: 220 }, sourceType: "url", src: "", fit: "cover", opacity: 100, alt: "" } as any); return }
    if (type === "gauge") { addWidget({ ...base, size: { width: 260, height: 200 }, title: "Gauge", query: { xColumn: "", yColumn: "", aggregation: "SUM" } } as any); return }
    if (type === "scatter") { addWidget({ ...base, title: "Scatter", query: { xColumn: "", yColumn: "", aggregation: "SUM" } } as any); return }
    if (type === "radar")   { addWidget({ ...base, title: "Radar",   query: { xColumn: "", yColumn: "", aggregation: "SUM" } } as any); return }
    // bar, line, area, stacked-bar, donut, pie, timeline
    addWidget({ ...base, title: "Chart", query: { xColumn: "", yColumn: "", aggregation: "SUM" } } as any)
  }

  return { fieldGhost, handleFieldDragOver, handleFieldDragLeave, handleDrop }
}
