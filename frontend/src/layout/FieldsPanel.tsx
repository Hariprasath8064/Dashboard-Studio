import { useState, useMemo } from "react"
import DatasetFields from "../sidebar/DatasetFields"
import { useDashboardStore } from "../store/dashboardStore"

export default function FieldsPanel() {

  const dataset       = useDashboardStore((s) => s.dashboard.dataset)
  const datasetName   = useDashboardStore((s) => s.datasetName)
  const [open, setOpen]     = useState(true)
  const [search, setSearch] = useState("")

  const stats = useMemo(() => {
    if (!dataset) return null
    const dims    = dataset.columns.filter((c) => c.type !== "number").length
    const metrics = dataset.columns.filter((c) => c.type === "number").length
    return { total: dataset.columns.length, rows: dataset.rows.length, dims, metrics }
  }, [dataset])

  return (
    <div className={`fields-panel${open ? " fields-panel-open" : " fields-panel-closed"}`}>

      {/* ── Collapse toggle strip ── */}
      <button
        className="fields-panel-toggle"
        onClick={() => setOpen((o) => !o)}
        title={open ? "Collapse fields panel" : "Expand fields panel"}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"
          style={{ transform: open ? "none" : "rotate(180deg)", transition: "transform .2s" }}>
          <path d="M8 2.5L4.5 6.5l3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {!open && (
        <div className="fp-collapsed-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M2 7h7M2 10h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
      )}

      {open && (
        <div className="fields-panel-body">

          {/* ── Header ── */}
          <div className="fields-panel-header">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h7M2 10h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span className="fields-panel-title">Fields</span>
            {stats && <span className="fields-panel-count">{stats.total}</span>}
          </div>

          {/* ── Dataset stat card ── */}
          {dataset && stats ? (
            <>
              <div className="fp-dataset-card">
                <div className="fp-dataset-name" title={datasetName || ""}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/>
                    <path d="M4 2v3M8 2v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                  {datasetName || "Dataset"}
                </div>
                <div className="fp-stat-row">
                  <span className="fp-stat"><b>{stats.rows}</b> rows</span>
                  <span className="fp-stat-sep">·</span>
                  <span className="fp-stat fp-stat-dim"><b>{stats.dims}</b> dim</span>
                  <span className="fp-stat-sep">·</span>
                  <span className="fp-stat fp-stat-metric"><b>{stats.metrics}</b> metric</span>
                </div>
              </div>

              {/* ── Search bar ── */}
              <div className="fp-search-wrap">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="fp-search-icon">
                  <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <input
                  className="fp-search"
                  placeholder="Search fields…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="fp-search-clear" onClick={() => setSearch("")}>×</button>
                )}
              </div>

              <div className="fp-hint">Drag a field onto the canvas or a widget</div>

              <div className="fields-panel-scroll">
                <DatasetFields search={search} />
              </div>
            </>
          ) : (
            <div className="fp-empty">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4 11h20" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M10 6v5M18 6v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span>Load a dataset in the<br/>Data tab to see fields</span>
            </div>
          )}

        </div>
      )}

    </div>
  )

}
