import { useRef, useState, useEffect } from "react"
import { loadDataset } from "../services/DatasetService"
import { datasetApi, type SavedDatasetMeta } from "../services/datasetApi"
import { useDashboardStore } from "../store/dashboardStore"

export default function DatasetPanel() {

  const setDataset          = useDashboardStore((s) => s.setDataset)
  const setSavedDatasetId   = useDashboardStore((s) => s.setSavedDatasetId)
  const datasetName         = useDashboardStore((s) => s.datasetName)
  const dataset             = useDashboardStore((s) => s.dashboard.dataset)
  const savedDatasetId      = useDashboardStore((s) => s.savedDatasetId)
  const [dragging, setDragging]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [savedDatasets, setSavedDatasets] = useState<SavedDatasetMeta[]>([])
  const [listOpen, setListOpen]         = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    datasetApi.list().then(setSavedDatasets).catch(() => {})
  }, [])

  async function processFile(file: File) {
    setLoading(true)
    try {
      const result = await loadDataset(file)
      // Try to persist to backend; fall back silently if backend is offline.
      let remoteId: string | null = savedDatasetId
      try {
        const saved = await datasetApi.save(file.name, result)
        remoteId = saved.id
        setSavedDatasets((prev) => [saved, ...prev.filter((d) => d.id !== saved.id)])
      } catch { /* offline / backend not running — continue locally */ }
      setDataset(result, file.name, remoteId)
    } finally {
      setLoading(false)
    }
  }

  async function loadSaved(meta: SavedDatasetMeta) {
    setLoading(true)
    try {
      const row = await datasetApi.get(meta.id)
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

    </div>

  )

}