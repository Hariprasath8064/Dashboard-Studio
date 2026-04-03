import { useDashboardStore } from "../store/dashboardStore"
import type { DatasetColumn } from "../types/datasetTypes"

// ── Field-type icons ──────────────────────────────────────

function DimIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1" width="10" height="3.5" rx="1" fill="currentColor" opacity=".35"/>
      <rect x="1" y="7.5" width="10" height="3.5" rx="1" fill="currentColor" opacity=".35"/>
      <rect x="1" y="1" width="3" height="10" rx="1" fill="currentColor"/>
    </svg>
  )
}

function MetricIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M1 10L3.5 6l2 2.5L8 3.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DateIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="2.5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
      <path d="M4 1v3M8 1v3M1 5.5h10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}

// ── Single chip ───────────────────────────────────────────

type FieldRole = "dim" | "date" | "metric"

function getRole(col: DatasetColumn): FieldRole {
  if (col.type === "number") return "metric"
  if (col.type === "date")   return "date"
  return "dim"
}

function FieldChip({
  col,
  onDragStart,
}: {
  col: DatasetColumn
  onDragStart: (e: React.DragEvent, col: DatasetColumn) => void
}) {
  const role = getRole(col)
  return (
    <div
      className={`col-chip col-chip-${role}`}
      draggable
      title={`${col.name} · ${col.type}`}
      onDragStart={(e) => onDragStart(e, col)}
    >
      <span className="col-chip-icon">
        {role === "metric" ? <MetricIcon /> : role === "date" ? <DateIcon /> : <DimIcon />}
      </span>
      <span className="col-name">{col.name}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────

export default function DatasetFields({ search = "" }: { search?: string }) {

  const dataset = useDashboardStore((s) => s.dashboard.dataset)

  if (!dataset) {
    return <div className="fields-empty">Load a dataset to see fields</div>
  }

  function startDrag(e: React.DragEvent, col: DatasetColumn) {
    e.dataTransfer.setData("dataset-column", col.name)
    e.dataTransfer.setData("dataset-column-type", col.type)
    e.dataTransfer.effectAllowed = "copy"
  }

  const q = search.toLowerCase()
  const allDimensions = dataset.columns.filter((c) => c.type !== "number")
  const allMetrics    = dataset.columns.filter((c) => c.type === "number")
  const dimensions    = q ? allDimensions.filter((c) => c.name.toLowerCase().includes(q)) : allDimensions
  const metrics       = q ? allMetrics.filter((c)    => c.name.toLowerCase().includes(q)) : allMetrics

  if (q && dimensions.length === 0 && metrics.length === 0) {
    return <div className="fields-empty">No fields match "{search}"</div>
  }

  return (

    <div>

      {dimensions.length > 0 && (
        <div className="field-group">
          <div className="field-group-header field-group-dim">
            <DimIcon /> Dimensions
          </div>
          {dimensions.map((col) => (
            <FieldChip key={col.name} col={col} onDragStart={startDrag} />
          ))}
        </div>
      )}

      {metrics.length > 0 && (
        <div className="field-group">
          <div className="field-group-header field-group-metric">
            <MetricIcon /> Metrics
          </div>
          {metrics.map((col) => (
            <FieldChip key={col.name} col={col} onDragStart={startDrag} />
          ))}
        </div>
      )}

    </div>

  )

}