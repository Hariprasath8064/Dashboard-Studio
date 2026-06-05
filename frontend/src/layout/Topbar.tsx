import { useEffect, useRef, useState } from "react"
import { exportDashboard } from "../export/ExportService"
import { useDashboardStore } from "../store/dashboardStore"
import { dashboardApi } from "../services/dashboardApi"
import DashboardGallery from "../pages/DashboardGallery"

import type { BuilderView } from "../store/slices/builderUiSlice"
import AppLogo from "../components/AppLogo"

interface Props {
  view: BuilderView
  setView: (v: BuilderView) => void
}

export default function Topbar({ view, setView }: Props) {

  const dashboard               = useDashboardStore((s) => s.dashboard)
  const openQueryEditor         = useDashboardStore((s) => s.openQueryEditor)
  const bigfixMode              = dashboard.bigfixMode
  const hasBigfixQueries        = useDashboardStore((s) => s.bigfixDataSources.some(x => x.generatedQuery?.trim()))
  const renameDashboard         = useDashboardStore((s) => s.renameDashboard)
  const resetDashboard          = useDashboardStore((s) => s.resetDashboard)
  const savedDashboardId        = useDashboardStore((s) => s.savedDashboardId)
  const savedDatasetId          = useDashboardStore((s) => s.savedDatasetId)
  const setSavedDashboardId     = useDashboardStore((s) => s.setSavedDashboardId)
  const setDataset              = useDashboardStore((s) => s.setDataset)
  const setBigfixPendingRefresh = useDashboardStore((s) => s.setBigfixPendingRefresh)
  const persistBigfixSources    = useDashboardStore((s) => s.persistBigfixSources)
  const bigfixDataSources       = useDashboardStore((s) => s.bigfixDataSources)

  const [editing, setEditing]       = useState(false)
  const [nameInput, setNameInput]   = useState("")
  const [saving, setSaving]         = useState(false)
  const [saveStatus, setSaveStatus] = useState<"" | "saved" | "error">("")
  const [showGallery, setShowGallery] = useState(false)
  const [fileMenuOpen, setFileMenuOpen] = useState(false)
  const [loadError, setLoadError]   = useState<string | null>(null)

  const loadRef    = useRef<HTMLInputElement>(null)
  const fileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fileMenuOpen) return
    function onDocClick(e: MouseEvent) {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [fileMenuOpen])

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
    setFileMenuOpen(false)
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
    setFileMenuOpen(false)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target!.result as string)
        if (data && typeof data === "object" && Array.isArray(data.widgets)) {
          resetDashboard(data)
          setLoadError(null)
        } else {
          setLoadError("Invalid dashboard JSON file.")
        }
      } catch {
        setLoadError("Could not parse JSON file.")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  async function saveToCloud() {
    setFileMenuOpen(false)
    setSaving(true)
    setSaveStatus("")
    try {
      let savedSources = dashboard.bigfixDataSources ?? []
      if (dashboard.bigfixMode && bigfixDataSources.length > 0) {
        savedSources = await persistBigfixSources()
      }

      const canvasPayload = {
        widgets:             dashboard.widgets,
        canvas:              dashboard.canvas,
        background:          dashboard.background,
        theme:               dashboard.theme,
        bigfixMode:          dashboard.bigfixMode,
        bigfixQueryConfig:   dashboard.bigfixQueryConfig,
        bigfixDataSources:   savedSources,
        activeDataSourceId:  dashboard.activeDataSourceId,
        bigfixFetchedAt:     dashboard.bigfixFetchedAt,
      }
      const payload = {
        name:       dashboard.name,
        dataset_id: savedSources[0]?.datasetId ?? savedDatasetId ?? undefined,
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

  function openGallery() {
    setFileMenuOpen(false)
    setShowGallery(true)
  }

  function triggerLoad() {
    setFileMenuOpen(false)
    loadRef.current?.click()
  }

  const cloudLabel = saving
    ? "Saving…"
    : saveStatus === "saved"
      ? "Saved!"
      : saveStatus === "error"
        ? "Save failed"
        : savedDashboardId
          ? "Save to cloud"
          : "Save to cloud"

  return (

    <div id="topbar">

      <div className="tb-left">
        <AppLogo size={32} showWordmark={false} />
        <div className="tb-breadcrumb">
          <span className="tb-breadcrumb-app">Dashboard Studio</span>
          <span className="tb-breadcrumb-sep" aria-hidden>/</span>
          {editing ? (
            <input
              className="tb-rename-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKey}
              autoFocus
              maxLength={60}
              aria-label="Dashboard name"
            />
          ) : (
            <span
              className="tb-breadcrumb-title"
              onClick={startRename}
              title="Click to rename"
            >
              {dashboard.name}
            </span>
          )}
        </div>
      </div>

      <div className="tb-center">
        <div className="tab-group" role="tablist" aria-label="Builder views">
          <button
            type="button"
            role="tab"
            aria-selected={view === "design"}
            className={`tab${view === "design" ? " active" : ""}`}
            onClick={() => setView("design")}
          >
            Design
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "preview"}
            className={`tab${view === "preview" ? " active" : ""}`}
            onClick={() => setView("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "code"}
            className={`tab${view === "code" ? " active" : ""}`}
            onClick={() => setView("code")}
          >
            Code
          </button>
          {bigfixMode && (
            <button
              type="button"
              role="tab"
              aria-selected={view === "query"}
              className={`tab${view === "query" ? " active" : ""}`}
              onClick={() => openQueryEditor()}
              title={hasBigfixQueries ? "View BigFix relevance queries" : "Fetch data first to see queries"}
            >
              Query
            </button>
          )}
        </div>
      </div>

      <div className="tb-right">
        {loadError && (
          <span className="tb-save-flash error" title={loadError}>Load failed</span>
        )}
        {saveStatus === "saved" && !fileMenuOpen && (
          <span className="tb-save-flash">Saved</span>
        )}
        {saveStatus === "error" && !fileMenuOpen && (
          <span className="tb-save-flash error">Save failed</span>
        )}

        <div className="tb-file-wrap" ref={fileMenuRef}>
          <button
            type="button"
            className="tb-btn"
            onClick={() => setFileMenuOpen(o => !o)}
            aria-expanded={fileMenuOpen}
            aria-haspopup="menu"
            title="File actions"
          >
            File
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>

          {fileMenuOpen && (
            <div className="tb-file-menu" role="menu">
              <button type="button" className="tb-file-menu-item" role="menuitem" onClick={openGallery}>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M1 6h7M1 9h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Open dashboard…
              </button>
              <button
                type="button"
                className="tb-file-menu-item"
                role="menuitem"
                onClick={saveToCloud}
                disabled={saving}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M9 4H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 1v3M8 1v3M1 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {cloudLabel}
              </button>
              <div className="tb-file-menu-divider" />
              <div className="tb-file-menu-hint">Local files</div>
              <button type="button" className="tb-file-menu-item" role="menuitem" onClick={saveJSON}>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 10h8M6 2v6M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Download JSON
              </button>
              <button type="button" className="tb-file-menu-item" role="menuitem" onClick={triggerLoad}>
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 8v2h8V8M6 2v6M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Load JSON…
              </button>
            </div>
          )}
        </div>

        <input
          ref={loadRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleLoadFile}
        />

        <button
          type="button"
          className="tb-btn primary"
          onClick={exportDashboard}
          title="Export dashboard as HTML"
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 10h8M6 8V2M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Export HTML
        </button>
      </div>

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
          setBigfixPendingRefresh={setBigfixPendingRefresh}
        />
      )}

    </div>

  )

}
