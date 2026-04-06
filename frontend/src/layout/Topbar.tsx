import { useRef, useState } from "react"
import { exportDashboard } from "../export/ExportService"
import { useDashboardStore } from "../store/dashboardStore"
import { dashboardApi } from "../services/dashboardApi"
import DashboardGallery from "../pages/DashboardGallery"

interface Props {
  view: "design" | "preview" | "code"
  setView: (v: "design" | "preview" | "code") => void
}

export default function Topbar({ view, setView }: Props) {

  const dashboard          = useDashboardStore((s) => s.dashboard)
  const renameDashboard    = useDashboardStore((s) => s.renameDashboard)
  const resetDashboard     = useDashboardStore((s) => s.resetDashboard)
  const savedDashboardId   = useDashboardStore((s) => s.savedDashboardId)
  const savedDatasetId     = useDashboardStore((s) => s.savedDatasetId)
  const setSavedDashboardId = useDashboardStore((s) => s.setSavedDashboardId)
  const setDataset         = useDashboardStore((s) => s.setDataset)

  const [editing, setEditing]     = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [saving, setSaving]       = useState(false)
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("")
  const [showGallery, setShowGallery] = useState(false)
  const loadRef = useRef<HTMLInputElement>(null)

  function startRename() {
    setNameInput(dashboard.name)
    setEditing(true)
  }

  function commitRename() {
    const trimmed = nameInput.trim()
    if (trimmed) renameDashboard(trimmed)
    setEditing(false)
  }

  function handleRenameKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitRename()
    if (e.key === "Escape") setEditing(false)
  }

  function saveJSON() {
    const json = JSON.stringify(dashboard, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${dashboard.name || "dashboard"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target!.result as string)
        if (data && typeof data === "object" && Array.isArray(data.widgets)) {
          resetDashboard(data)
        } else {
          alert("Invalid dashboard JSON file.")
        }
      } catch {
        alert("Could not parse JSON file.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  async function saveToCloud() {
    setSaving(true)
    setSaveStatus("")
    try {
      const canvasPayload = {
        widgets:    dashboard.widgets,
        canvas:     dashboard.canvas,
        background: dashboard.background,
      }
      const payload = {
        name:       dashboard.name,
        dataset_id: savedDatasetId ?? undefined,
        canvas_json: JSON.stringify(canvasPayload),
      }
      if (savedDashboardId) {
        await dashboardApi.update(savedDashboardId, payload)
      } else {
        const created = await dashboardApi.create(payload)
        setSavedDashboardId(created.id)
      }
      setSaveStatus("saved")
    } catch {
      setSaveStatus("error")
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(""), 2500)
    }
  }

  return (

    <div id="topbar">

      <div className="tb-logo">
        <div className="tb-logo-mark">
          <svg viewBox="0 0 14 14" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white"/>
            <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity=".7"/>
            <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity=".7"/>
            <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" opacity=".4"/>
          </svg>
        </div>
        Dashboard Studio
      </div>

      <div className="tb-div" />

      {editing ? (
        <input
          className="tb-rename-input"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleRenameKey}
          autoFocus
          maxLength={60}
        />
      ) : (
        <span
          className="tb-filename"
          onClick={startRename}
          title="Click to rename"
        >
          {dashboard.name}
        </span>
      )}

      <div className="tb-spacer" />

      <div className="tab-group">
        <button
          className={`tab${view === "design" ? " active" : ""}`}
          onClick={() => setView("design")}
        >
          Design
        </button>
        <button
          className={`tab${view === "preview" ? " active" : ""}`}
          onClick={() => setView("preview")}
        >
          Preview
        </button>
        <button
          className={`tab${view === "code" ? " active" : ""}`}
          onClick={() => setView("code")}
        >
          Code
        </button>
      </div>

      <div className="tb-div" />

      <button className="tb-btn" onClick={saveJSON}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10h8M6 2v6M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Save JSON
      </button>

      <button className="tb-btn" onClick={() => loadRef.current?.click()}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8v2h8V8M6 2v6M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Load
      </button>

      <input
        ref={loadRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleLoadFile}
      />

      <div className="tb-div" />

      {/* Cloud: open gallery */}
      <button className="tb-btn" onClick={() => setShowGallery(true)} title="Open saved dashboard">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M1 6h7M1 9h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        Open
      </button>

      {/* Cloud: save to backend */}
      <button
        className={`tb-btn${saveStatus === "saved" ? " success" : saveStatus === "error" ? " danger" : ""}`}
        onClick={saveToCloud}
        disabled={saving}
        title={savedDashboardId ? "Update saved dashboard" : "Save dashboard to backend"}
      >
        {saving ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
            </circle>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 4H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M4 1v3M8 1v3M1 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        )}
        {saveStatus === "saved" ? "Saved!" : saveStatus === "error" ? "Failed" : savedDashboardId ? "Update" : "Save"}
      </button>

      <button
        className="tb-btn primary"
        onClick={exportDashboard}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10h8M6 8V2M3 5l3 3 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Export HTML
      </button>

      {showGallery && (
        <DashboardGallery
          onClose={() => setShowGallery(false)}
          onLoad={(id) => {
            setSavedDashboardId(id)
            setShowGallery(false)
          }}
          setDataset={setDataset}
          setSavedDashboardId={setSavedDashboardId}
          resetDashboard={resetDashboard}
        />
      )}

    </div>

  )

}