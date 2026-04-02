import { useDashboardStore } from "../store/dashboardStore"
import type  { ChartWidget } from "../types/widgetTypes"

interface Props {
  widget: ChartWidget
}

export default function ChartProperties({ widget }: Props) {

  const dataset = useDashboardStore((s) => s.dashboard.dataset)
  const updateWidget = useDashboardStore((s) => s.updateWidget)

  if (!dataset) {
    return <div className="pp-section">Upload a dataset first</div>
  }

  function update(field: string, value: any) {

    updateWidget({
      ...widget,
      query: {
        ...widget.query,
        [field]: value
      }
    })

  }

  return (

    <div className="pp-section">

      <div className="pp-section-title">Chart Config</div>

      <div className="pp-row">
        <span className="pp-label">Title</span>
        <input
          className="pp-input"
          value={widget.title}
          onChange={(e) =>
            updateWidget({ ...widget, title: e.target.value })
          }
        />
      </div>

      <div className="pp-row">
        <span className="pp-label">X Axis</span>

        <select
          className="pp-select"
          value={widget.query.xColumn || ""}
          onChange={(e) => update("xColumn", e.target.value)}
        >

          <option value="">Select column</option>

          {dataset.columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      <div className="pp-row">
        <span className="pp-label">Y Axis</span>

        <select
          className="pp-select"
          value={widget.query.yColumn || ""}
          onChange={(e) => update("yColumn", e.target.value)}
        >

          <option value="">Select column</option>

          {dataset.columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}

        </select>

      </div>

      <div className="pp-row">

        <span className="pp-label">Aggregation</span>

        <select
          className="pp-select"
          value={widget.query.aggregation}
          onChange={(e) => update("aggregation", e.target.value)}
        >

          <option value="SUM">SUM</option>
          <option value="AVG">AVG</option>
          <option value="COUNT">COUNT</option>
          <option value="MIN">MIN</option>
          <option value="MAX">MAX</option>

        </select>

      </div>

    </div>

  )

}