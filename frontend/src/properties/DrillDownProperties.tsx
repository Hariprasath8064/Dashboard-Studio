import { useDashboardStore } from "../store/dashboardStore"
import type { DrillDownConfig } from "../types/widgetTypes"

interface Props {
  drillDown: DrillDownConfig | undefined
  onChange: (config: DrillDownConfig) => void
}

export default function DrillDownProperties({ drillDown, onChange }: Props) {

  const dataset  = useDashboardStore(s => s.dashboard.dataset)
  const enabled  = drillDown?.enabled  ?? false
  const dispCols = drillDown?.displayColumns ?? []

  function toggle(col: string) {
    const next = dispCols.includes(col)
      ? dispCols.filter(c => c !== col)
      : [...dispCols, col]
    onChange({ enabled, displayColumns: next })
  }

  return (
    <div className="pp-section">

      <div className="pp-section-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M6 4v4M4 6h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Drill-Down
      </div>

      <label className="pp-toggle-row">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onChange({ displayColumns: dispCols, enabled: e.target.checked })}
        />
        <span>Enable — click chart to reveal rows</span>
      </label>

      {enabled && dataset && (
        <>
          <div className="pp-label" style={{ marginTop: 10 }}>
            Show columns
            <span style={{ fontWeight: 400, color: "var(--text3)", marginLeft: 4 }}>(empty = all)</span>
          </div>
          <div className="dd-col-list">
            {dataset.columns.map(col => (
              <label key={col.name} className="dd-col-item">
                <input
                  type="checkbox"
                  checked={dispCols.includes(col.name)}
                  onChange={() => toggle(col.name)}
                />
                <span className={`bf-prop-type ${col.type === "number" ? "bf-prop-num" : "bf-prop-str"}`}>
                  {col.type === "number" ? "#" : "T"}
                </span>
                <span className="dd-col-name">{col.name}</span>
              </label>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
