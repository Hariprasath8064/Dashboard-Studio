import { useDashboardStore } from "../store/dashboardStore"

export default function DatasetFields() {

  const dataset = useDashboardStore((s) => s.dashboard.dataset)

  if (!dataset) {
    return <div>No dataset loaded</div>
  }

  function startDrag(e: React.DragEvent, column: string) {

    e.dataTransfer.setData("dataset-column", column)

  }

  return (

    <div>

      <div className="section-label">Fields</div>

      {dataset.columns.map((col) => (

        <div
          key={col.name}
          className="col-chip"
          draggable
          onDragStart={(e) => startDrag(e, col.name)}
        >

          <span className="col-name">
            {col.name}
          </span>

          <span className="col-type">
            {col.type}
          </span>

        </div>

      ))}

    </div>

  )

}