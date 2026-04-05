import { useRef, useState } from "react"
import { exportDashboard } from "../export/ExportService"
import { useDashboardStore } from "../store/dashboardStore"

interface Props {
  view: "design" | "preview" | "code"
  setView: (v: "design" | "preview" | "code") => void
}

export default function Topbar({ view, setView }: Props) {

  const dashboard = useDashboardStore((s) => s.dashboard)
  const renameDashboard = useDashboardStore((s) => s.renameDashboard)
  const resetDashboard = useDashboardStore((s) => s.resetDashboard)

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState("")
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

      <button
        className="tb-btn primary"
        onClick={exportDashboard}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10h8M6 8V2M3 5l3 3 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Export HTML
      </button>

    </div>

  )

}