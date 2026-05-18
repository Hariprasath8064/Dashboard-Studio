import { useEffect, useState } from "react"
import { dashboardApi, type DashboardMeta } from "../services/dashboardApi"
import { datasetApi } from "../services/datasetApi"
import type { Dataset } from "../types/datasetTypes"

interface Props {
  onClose: () => void
  onLoad: (id: string) => void
  setDataset: (dataset: Dataset, name: string, datasetId?: string | null) => void
  setSavedDashboardId: (id: string | null) => void
  resetDashboard: (data: any) => void
  setBigfixPendingRefresh: (v: boolean) => void
}

export default function DashboardGallery({ onClose, onLoad, setDataset, setSavedDashboardId, resetDashboard, setBigfixPendingRefresh }: Props) {
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
      resetDashboard({
        id:                meta.id,
        name:              meta.name,
        canvas:            parsed.canvas            ?? { width: 1200, height: 720 },
        background:        parsed.background        ?? { color: "#f4f6f9" },
        widgets:           parsed.widgets           ?? [],
        theme:             parsed.theme,
        dataset:           null,
        bigfixMode:        parsed.bigfixMode        ?? false,
        bigfixQueryConfig: parsed.bigfixQueryConfig ?? undefined,
        bigfixFetchedAt:   parsed.bigfixFetchedAt   ?? undefined,
      })
      setSavedDashboardId(meta.id)

      // Rehydrate snapshot dataset (Excel or BigFix) from the linked dataset record
      const datasetLabel = meta.dataset_name
        ?? (parsed.bigfixMode && parsed.bigfixQueryConfig?.objectType
          ? `BigFix: ${parsed.bigfixQueryConfig.objectType}`
          : "dataset")

      if (loaded.dataset_id && loaded.dataset) {
        try {
          const ds: Dataset = JSON.parse(loaded.dataset)
          setDataset(ds, datasetLabel, loaded.dataset_id)
        } catch { /* ignore parse failure */ }
      } else if (loaded.dataset_id) {
        try {
          const row = await datasetApi.get(loaded.dataset_id)
          const ds: Dataset = JSON.parse(row.data)
          setDataset(ds, datasetLabel, loaded.dataset_id)
        } catch { /* ignore */ }
      }

      // If this is a BigFix dashboard, queue a background refresh once schema loads
      if (parsed.bigfixMode && parsed.bigfixQueryConfig?.objectType && parsed.bigfixQueryConfig?.dimension) {
        setBigfixPendingRefresh(true)
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
