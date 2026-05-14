import type { KPIWidget } from "../types/widgetTypes"
import { useDashboardStore } from "../store/dashboardStore"

const AGGREGATIONS = ["SUM", "AVG", "COUNT", "MIN", "MAX"]

interface Props {
  widget: KPIWidget
}

export default function KPIProperties({ widget }: Props) {

  const dataset      = useDashboardStore((s) => s.dashboard.dataset)
  const updateWidget = useDashboardStore((s) => s.updateWidget)

  if (!dataset) return (
    <div className="pp-section">
      <div className="pp-empty-sm">Upload a dataset to configure this KPI</div>
    </div>
  )

  return (

    <div className="pp-section">

      <div className="pp-section-title">KPI Config</div>

      {/* Label */}
      <div className="pp-row">
        <span className="pp-label">Label</span>
        <input
          className="pp-input"
          value={widget.label}
          onChange={(e) => updateWidget({ ...widget, label: e.target.value })}
        />
      </div>

      {/* Value column */}
      <div className="pp-row">
        <span className="pp-label">Column</span>
        <select
          className="pp-select"
          value={widget.valueColumn}
          onChange={(e) => updateWidget({ ...widget, valueColumn: e.target.value })}
        >
          <option value="">Select column</option>
          {dataset.columns.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Aggregation */}
      <div className="pp-row">
        <span className="pp-label">Aggregation</span>
        <div className="pp-agg-group">
          {AGGREGATIONS.map(agg => (
            <button
              key={agg}
              className={`pp-agg-btn${(widget.aggregation || "SUM") === agg ? " active" : ""}`}
              onClick={() => updateWidget({ ...widget, aggregation: agg })}
            >
              {agg}
            </button>
          ))}
        </div>
      </div>

      <div className="pp-section-divider" />

      {/* Prefix */}
      <div className="pp-row">
        <span className="pp-label">Prefix</span>
        <input
          className="pp-input pp-input-sm"
          placeholder="e.g. $"
          value={widget.prefix || ""}
          onChange={(e) => updateWidget({ ...widget, prefix: e.target.value })}
        />
      </div>

      {/* Suffix */}
      <div className="pp-row">
        <span className="pp-label">Suffix</span>
        <input
          className="pp-input pp-input-sm"
          placeholder="e.g. %"
          value={widget.suffix || ""}
          onChange={(e) => updateWidget({ ...widget, suffix: e.target.value })}
        />
      </div>

      {/* Decimal places */}
      <div className="pp-row">
        <span className="pp-label">Decimals</span>
        <input
          className="pp-input pp-input-sm"
          type="number"
          min={0}
          max={6}
          value={widget.decimals ?? 0}
          onChange={(e) => updateWidget({ ...widget, decimals: Math.max(0, Math.min(6, Number(e.target.value))) })}
        />
      </div>

      {/* Font size */}
      <div className="pp-row">
        <span className="pp-label">Font size</span>
        <input
          className="pp-input pp-input-sm"
          type="number"
          min={16}
          max={96}
          step={2}
          value={widget.fontSize || 36}
          onChange={(e) => updateWidget({ ...widget, fontSize: Math.max(16, Math.min(96, Number(e.target.value))) })}
        />
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>px</span>
      </div>

    </div>

  )

}