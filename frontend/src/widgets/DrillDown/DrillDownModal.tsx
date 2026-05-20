import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useDashboardStore } from "../../store/dashboardStore"

export default function DrillDownModal() {

  const drillDown     = useDashboardStore(s => s.drillDown)
  const dataset       = useDashboardStore(s => s.dashboard.dataset)
  const closeDrillDown = useDashboardStore(s => s.closeDrillDown)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!drillDown) return
    document.body.classList.add("dd-open")
    return () => document.body.classList.remove("dd-open")
  }, [drillDown])

  const colIndices = useMemo(() => {
    if (!dataset) return []
    const cols = (drillDown?.displayColumns?.length ?? 0) > 0
      ? drillDown!.displayColumns!
      : dataset.columns.map(c => c.name)
    return cols
      .map(name => ({ name, idx: dataset.columns.findIndex(c => c.name === name) }))
      .filter(c => c.idx >= 0)
  }, [dataset, drillDown])

  const filteredRows = useMemo(() => {
    if (!dataset || !drillDown) return []
    const { filterColumn, filterLabel } = drillDown
    if (!filterColumn || filterLabel === null) return dataset.rows
    const ci = dataset.columns.findIndex(c => c.name === filterColumn)
    if (ci < 0) return dataset.rows
    return dataset.rows.filter(row => String(row[ci]) === String(filterLabel))
  }, [dataset, drillDown])

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return filteredRows
    return filteredRows.filter(row =>
      colIndices.some(({ idx }) => String(row[idx] ?? "").toLowerCase().includes(q))
    )
  }, [filteredRows, search, colIndices])

  if (!drillDown || !dataset) return null

  function downloadCSV() {
    const header = colIndices.map(c => c.name).join(",")
    const body   = filteredRows.map(row =>
      colIndices.map(({ idx }) => JSON.stringify(row[idx] ?? "")).join(",")
    ).join("\n")
    const a   = document.createElement("a")
    a.href    = "data:text/csv;charset=utf-8," + encodeURIComponent(header + "\n" + body)
    a.download = `${drillDown!.filterLabel || drillDown!.widgetTitle || "rows"}.csv`
    a.click()
  }

  return createPortal(
    <div className="dd-backdrop" onClick={closeDrillDown}>
      <div className="dd-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="dd-header">
          <div className="dd-title-block">
            <div className="dd-title">{drillDown.widgetTitle || "Detail"}</div>
            {drillDown.filterLabel && (
              <div className="dd-label-badge">{drillDown.filterLabel}</div>
            )}
          </div>
          <div className="dd-count">{filteredRows.length} rows</div>
          <button className="dd-close" onClick={closeDrillDown} title="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="dd-toolbar">
          <div className="dd-search-wrap">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              className="dd-search"
              placeholder="Search rows…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className="dd-search-clear" onClick={() => setSearch("")}>×</button>
            )}
          </div>
          <button className="dd-csv-btn" onClick={downloadCSV} title="Download as CSV">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            CSV
          </button>
        </div>

        {/* ── Table ── */}
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead>
              <tr>
                <th className="dd-th-rn">#</th>
                {colIndices.map(c => <th key={c.name}>{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr key={i} className={i % 2 !== 0 ? "dd-tr-alt" : ""}>
                  <td className="dd-td-rn">{i + 1}</td>
                  {colIndices.map(({ name, idx }) => (
                    <td key={name} title={String(row[idx] ?? "")}>
                      {String(row[idx] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={colIndices.length + 1} className="dd-empty">
                    No matching rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>,
    document.body
  )
}
