import { useEffect, useState } from "react"
import { dashboardApi, type DashboardMeta } from "../services/dashboardApi"
import { datasetApi } from "../services/datasetApi"
import { useDashboardStore } from "../store/dashboardStore"
import type { Dataset } from "../types/datasetTypes"
import type { BigfixDataSource } from "../types/bigfixTypes"
import { bigfixSourceLabel } from "../utils/bigfixQueryUtils"

interface Props {
  onClose: () => void
  onLoad: (id: string) => void
  setDataset: (dataset: Dataset, name: string, datasetId?: string | null) => void
  setSavedDashboardId: (id: string | null) => void
  resetDashboard: (data: any) => void
  setBigfixPendingRefresh: (v: boolean) => void
}

export default function DashboardGallery({
  onClose,
  onLoad,
  setDataset,
  setSavedDashboardId,
  resetDashboard,
  setBigfixPendingRefresh,
}: Props) {
  const setBigfixSourcesFromLoad = useDashboardStore(s => s.setBigfixSourcesFromLoad)

  const [items, setItems]     = useState<DashboardMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi.list()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function open(meta: DashboardMeta) {
    setOpening(meta.id)
    try {
      const loaded = await dashboardApi.get(meta.id)
      const parsed = JSON.parse(loaded.canvas_json)

      let sources: BigfixDataSource[] = parsed.bigfixDataSources ?? []
      const datasets: Record<string, Dataset> = {}

      if (sources.length === 0 && parsed.bigfixMode && parsed.bigfixQueryConfig?.objectType) {
        const legacyId = crypto.randomUUID()
        let legacyDataset: Dataset | null = null
        if (loaded.dataset) {
          try { legacyDataset = JSON.parse(loaded.dataset) } catch { /* ignore */ }
        } else if (loaded.dataset_id) {
          try {
            const row = await datasetApi.get(loaded.dataset_id)
            legacyDataset = JSON.parse(row.data)
          } catch { /* ignore */ }
        }
        sources = [{
          id: legacyId,
          name: bigfixSourceLabel(parsed.bigfixQueryConfig.objectType),
          queryConfig: parsed.bigfixQueryConfig,
          generatedQuery: "",
          fetchedAt: parsed.bigfixFetchedAt ?? new Date().toISOString(),
          datasetId: loaded.dataset_id ?? null,
        }]
        if (legacyDataset) datasets[legacyId] = legacyDataset
      }

      for (const src of sources) {
        if (src.datasetId && !datasets[src.id]) {
          try {
            const row = await datasetApi.get(src.datasetId)
            datasets[src.id] = JSON.parse(row.data)
          } catch { /* ignore */ }
        }
      }

      const defaultSourceId = parsed.activeDataSourceId ?? sources[0]?.id
      const widgets = (parsed.widgets ?? []).map((w: any) => ({
        ...w,
        dataSourceId: w.dataSourceId ?? defaultSourceId,
      }))

      resetDashboard({
        id:                meta.id,
        name:              meta.name,
        canvas:            parsed.canvas            ?? { width: 1200, height: 720 },
        background:        parsed.background        ?? { color: "#f4f6f9" },
        widgets,
        theme:             parsed.theme,
        dataset:           null,
        bigfixMode:        parsed.bigfixMode        ?? false,
        bigfixQueryConfig: parsed.bigfixQueryConfig ?? undefined,
        bigfixDataSources: sources,
        activeDataSourceId: defaultSourceId,
        bigfixFetchedAt:   parsed.bigfixFetchedAt   ?? undefined,
      })
      setSavedDashboardId(meta.id)

      if (parsed.bigfixMode && sources.length > 0) {
        setBigfixSourcesFromLoad(sources, datasets)
        if (sources.some(s => s.queryConfig?.objectType && s.queryConfig?.dimension)) {
          setBigfixPendingRefresh(true)
        }
      } else {
        const datasetLabel = meta.dataset_name ?? "dataset"
        if (loaded.dataset_id && loaded.dataset) {
          try {
            const ds: Dataset = JSON.parse(loaded.dataset)
            setDataset(ds, datasetLabel, loaded.dataset_id)
          } catch { /* ignore */ }
        } else if (loaded.dataset_id) {
          try {
            const row = await datasetApi.get(loaded.dataset_id)
            const ds: Dataset = JSON.parse(row.data)
            setDataset(ds, datasetLabel, loaded.dataset_id)
          } catch { /* ignore */ }
        }
      }

      onLoad(meta.id)
    } catch {
      setOpening(null)
    }
  }

  async function deleteDashboard(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await dashboardApi.delete(id)
      setItems((prev) => prev.filter((d) => d.id !== id))
    } catch { /* ignore */ }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">Saved Dashboards</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && <div className="gallery-empty">Loading…</div>}
          {!loading && items.length === 0 && (
            <div className="gallery-empty">No saved dashboards yet.</div>
          )}
          {!loading && items.map((meta) => (
            <div
              key={meta.id}
              className={`gallery-item${opening === meta.id ? " loading" : ""}`}
              onClick={() => open(meta)}
            >
              <div className="gallery-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M2 8h20" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M7 12h4M7 16h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="gallery-item-info">
                <span className="gallery-item-name">{meta.name}</span>
                {meta.dataset_name && (
                  <span className="gallery-item-sub">{meta.dataset_name}</span>
                )}
              </div>
              <div className="gallery-item-date">
                {new Date(meta.updated_at).toLocaleDateString()}
              </div>
              <button
                className="gallery-item-del"
                onClick={(e) => deleteDashboard(meta.id, e)}
                title="Delete"
              >×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
