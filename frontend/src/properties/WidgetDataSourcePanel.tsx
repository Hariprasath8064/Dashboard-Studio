import { useDashboardStore } from "../store/dashboardStore"
import type { Widget } from "../types/widgetTypes"
import { describeWidgetDataUse } from "../utils/bigfixQueryUtils"

interface Props {
  widget: Widget
}

export default function WidgetDataSourcePanel({ widget }: Props) {
  const bigfixMode           = useDashboardStore(s => s.dashboard.bigfixMode)
  const sources              = useDashboardStore(s => s.bigfixDataSources)
  const setWidgetDataSource  = useDashboardStore(s => s.setWidgetDataSource)
  const openQueryEditor      = useDashboardStore(s => s.openQueryEditor)

  if (!bigfixMode) return null

  const sourceId = widget.dataSourceId ?? sources[0]?.id
  const source   = sources.find(s => s.id === sourceId)

  return (
    <div className="pp-section">
      <div className="pp-section-title">Data source</div>

      {sources.length > 0 && (
        <div className="pp-row">
          <span className="pp-label">Fetch</span>
          <select
            className="pp-select"
            value={sourceId ?? ""}
            onChange={e => setWidgetDataSource(widget.id, e.target.value)}
          >
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {source ? (
        <>
          {source.generatedQuery?.trim() ? (
            <button
              type="button"
              className="pp-link-btn"
              onClick={() => openQueryEditor(source.id)}
            >
              View BigFix query in Query tab →
            </button>
          ) : (
            <div className="pp-empty-sm">No query stored for this fetch yet.</div>
          )}
          <div className="bf-widget-use">
            <div className="bf-widget-use-title">This widget</div>
            <code className="bf-widget-use-code">{describeWidgetDataUse(widget)}</code>
          </div>
        </>
      ) : (
        <div className="pp-empty-sm">Fetch data in the Fields panel first.</div>
      )}
    </div>
  )
}
