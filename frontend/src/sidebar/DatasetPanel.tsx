import { useRef, useState, useEffect } from "react"
import { loadDataset } from "../services/DatasetService"
import { datasetApi, type SavedDatasetMeta } from "../services/datasetApi"
import { fetchInspectorSchema } from "../services/bigfixApi"
import { useDashboardStore } from "../store/dashboardStore"
import { useBigfixAutoRefresh } from "../hooks/useBigfixAutoRefresh"

function formatFetchedAt(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = Math.floor((now - d.getTime()) / 1000)
  if (diff < 60)  return "Data fetched just now"
  if (diff < 3600) return `Data from ${Math.floor(diff / 60)} min ago`
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return `Data from today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
  return `Data from ${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

export default function DatasetPanel() {

  const setDataset        = useDashboardStore((s) => s.setDataset)
  const setSavedDatasetId = useDashboardStore((s) => s.setSavedDatasetId)
  const datasetName       = useDashboardStore((s) => s.datasetName)
  const dataset           = useDashboardStore((s) => s.dashboard.dataset)
  const savedDatasetId    = useDashboardStore((s) => s.savedDatasetId)
  const bigfixMode        = useDashboardStore((s) => s.dashboard.bigfixMode ?? false)
  const bigfixSchema      = useDashboardStore((s) => s.bigfixSchema)
  const setBigfixMode     = useDashboardStore((s) => s.setBigfixMode)
  const setBigfixSchema   = useDashboardStore((s) => s.setBigfixSchema)
  const bigfixFetchedAt   = useDashboardStore((s) => s.dashboard.bigfixFetchedAt)

  const { status: refreshStatus, refresh } = useBigfixAutoRefresh()

  const [dragging, setDragging]           = useState(false)
  const [loading, setLoading]             = useState(false)
  const [savedDatasets, setSavedDatasets] = useState<SavedDatasetMeta[]>([])
  const [listOpen, setListOpen]           = useState(false)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [schemaError, setSchemaError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    datasetApi.list().then(setSavedDatasets).catch(() => {})
  }, [])

  // Auto-load BigFix schema when mode is switched on
  useEffect(() => {
    if (!bigfixMode || bigfixSchema) return
    setSchemaLoading(true)
    setSchemaError(null)
    fetchInspectorSchema()
      .then(schema => { setBigfixSchema(schema); setSchemaLoading(false) })
      .catch(err   => { setSchemaError(String(err?.message ?? err)); setSchemaLoading(false) })
  }, [bigfixMode, bigfixSchema, setBigfixSchema])

  async function processFile(file: File) {
    setLoading(true)
    try {
      const result = await loadDataset(file)
      let remoteId: string | null = savedDatasetId
      try {
        const saved = await datasetApi.save(file.name, result)
        remoteId = saved.id
        setSavedDatasets((prev) => [saved, ...prev.filter((d) => d.id !== saved.id)])
      } catch { /* backend offline — continue locally */ }
      setDataset(result, file.name, remoteId)
    } finally {
      setLoading(false)
    }
  }

  async function loadSaved(meta: SavedDatasetMeta) {
    setLoading(true)
    try {
      const row    = await datasetApi.get(meta.id)
      const parsed = JSON.parse(row.data)
      setDataset(parsed, meta.name, meta.id)
      setSavedDatasetId(meta.id)
    } catch (err) {
      console.error("Failed to load dataset", err)
    } finally {
      setLoading(false)
    }
  }

  async function deleteDataset(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await datasetApi.delete(id)
      setSavedDatasets((prev) => prev.filter((d) => d.id !== id))
    } catch { /* ignore */ }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    processFile(file)
  }

  return (
    <div style={{ marginTop: 16 }}>

      <div className="section-label" style={{ marginBottom: 8 }}>Data Source</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>

        <label
          className={`ds-source-option${!bigfixMode ? " active" : ""}`}
          onClick={() => setBigfixMode(false)}
          style={{ cursor: "pointer" }}
        >
          <span className={`ds-source-checkbox${!bigfixMode ? " checked" : ""}`}>
            {!bigfixMode && (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Excel / CSV</span>
        </label>

        <label
          className={`ds-source-option${bigfixMode ? " active" : ""}`}
          onClick={() => setBigfixMode(true)}
          style={{ cursor: "pointer" }}
        >
          <span className={`ds-source-checkbox${bigfixMode ? " checked" : ""}`}>
            {bigfixMode && (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500 }}>BigFix Live Data</span>
        </label>

      </div>

      {bigfixMode && (
        <div className="ds-bigfix-status">
          {schemaLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text2)", fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .8s linear infinite", flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round"/>
              </svg>
              Connecting to BigFix…
            </div>
          )}

          {schemaError && (
            <div style={{ fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontWeight: 600, marginBottom: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Connection failed
              </div>
              <div style={{ color: "var(--text3)", fontSize: 11, lineHeight: 1.4 }}>
                {schemaError}<br/>
                Check the backend is running and <code style={{ fontSize: 10 }}>backend/.env</code> has valid BigFix credentials.
              </div>
              <button
                style={{ marginTop: 8, fontSize: 11, padding: "3px 10px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--bg1)", cursor: "pointer" }}
                onClick={() => { setBigfixSchema(null as any); setSchemaError(null) }}
              >
                Retry
              </button>
            </div>
          )}

          {!schemaLoading && !schemaError && bigfixSchema && (
            <div style={{ fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#16a34a", fontWeight: 600, marginBottom: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Connected to BigFix
              </div>
              <div style={{ color: "var(--text3)", fontSize: 11, lineHeight: 1.5 }}>
                {bigfixSchema.objectsList.length} object types available.<br/>
                Open the <strong>Fields</strong> tab to build your query and fetch data.
              </div>
              {dataset && (
                <div style={{ marginTop: 6, color: "var(--text2)", fontSize: 11 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4, verticalAlign: "middle" }}>
                    <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  {dataset.rows.length} rows · {dataset.columns.length} fields loaded
                </div>
              )}

              {/* Data freshness indicator */}
              <div className="bf-freshness">
                <span className="bf-freshness-ts">
                  {refreshStatus === "refreshing" && (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .8s linear infinite", verticalAlign: "middle", marginRight: 4 }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round"/>
                      </svg>
                      Refreshing…
                    </>
                  )}
                  {refreshStatus === "done" && (
                    <>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ verticalAlign: "middle", marginRight: 4 }}>
                        <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Updated just now
                    </>
                  )}
                  {refreshStatus === "error" && "Refresh failed"}
                  {refreshStatus === "idle" && bigfixFetchedAt && formatFetchedAt(bigfixFetchedAt)}
                </span>
                {refreshStatus !== "refreshing" && (
                  <button
                    className="bf-refresh-btn"
                    onClick={refresh}
                    title="Refresh data from BigFix"
                    disabled={!bigfixSchema}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!bigfixMode && (
        <>
          <div className="section-label">Dataset</div>

          <div
            className={`upload-zone${dragging ? " drag-over" : ""}${datasetName ? " has-file" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={handleChange}
            />

            <div className="upload-icon">
              {loading ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              ) : datasetName ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V3m0 0L8 7m4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
            </div>

            {datasetName ? (
              <>
                <div className="upload-filename">{datasetName}</div>
                <div className="upload-sub">
                  {dataset ? `${dataset.columns.length} columns · ${dataset.rows.length} rows` : ""}
                  {" · "}Click to replace
                </div>
              </>
            ) : (
              <>
                <div className="upload-text">{dragging ? "Drop to load" : "Click or drag & drop"}</div>
                <div className="upload-sub">.xlsx · .xls · .csv</div>
              </>
            )}
          </div>

          {savedDatasets.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button
                className="section-label"
                onClick={() => setListOpen((o) => !o)}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", width: "100%" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: listOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
                Saved Datasets ({savedDatasets.length})
              </button>

              {listOpen && (
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                  {savedDatasets.map((meta) => (
                    <div
                      key={meta.id}
                      className={`saved-item${meta.id === savedDatasetId ? " active" : ""}`}
                      onClick={() => loadSaved(meta)}
                      title={`${meta.row_count} rows · ${meta.col_count} cols`}
                    >
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.name}</span>
                      <button
                        className="saved-item-del"
                        onClick={(e) => deleteDataset(meta.id, e)}
                        title="Delete"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  )
}
