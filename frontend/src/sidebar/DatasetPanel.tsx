import { useRef, useState } from "react"
import { loadDataset } from "../services/DatasetService"
import { useDashboardStore } from "../store/dashboardStore"

export default function DatasetPanel() {

  const setDataset = useDashboardStore((s) => s.setDataset)
  const datasetName = useDashboardStore((s) => s.datasetName)
  const dataset = useDashboardStore((s) => s.dashboard.dataset)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    setLoading(true)
    try {
      const result = await loadDataset(file)
      setDataset(result, file.name)
    } finally {
      setLoading(false)
    }
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

    </div>

  )

}