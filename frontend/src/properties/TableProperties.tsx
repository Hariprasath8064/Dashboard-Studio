import { useState } from "react"
import type { TableWidget, ComputedColumn } from "../types/widgetTypes"
import { useDashboardStore } from "../store/dashboardStore"
import { generateId } from "../utils/id"

const THEMES = [
  { key: "default",  label: "Default",  hBg: "#f4f6f9", hFg: "#374151", stripe: null       },
  { key: "striped",  label: "Striped",  hBg: "#f4f6f9", hFg: "#374151", stripe: "#f0f4fa"  },
  { key: "bordered", label: "Bordered", hBg: "#f4f6f9", hFg: "#374151", stripe: null       },
  { key: "minimal",  label: "Minimal",  hBg: null,       hFg: "#1b1f24", stripe: null       },
  { key: "dark",     label: "Dark",     hBg: "#1b2230",  hFg: "#ffffff", stripe: "#f8f9fb" },
  { key: "blue",     label: "Blue",     hBg: "#2b7cff",  hFg: "#ffffff", stripe: "#eff5ff" },
  { key: "green",    label: "Green",    hBg: "#059669",  hFg: "#ffffff", stripe: "#f0fdf7" },
  { key: "rose",     label: "Rose",     hBg: "#e11d48",  hFg: "#ffffff", stripe: "#fff1f4" },
]

const FORMULAS = [
  { key: "add",      label: "Add (A + B + …)"        },
  { key: "subtract", label: "Subtract (A − B)"        },
  { key: "multiply", label: "Multiply (A × B × …)"   },
  { key: "divide",   label: "Divide (A ÷ B)"          },
  { key: "percent",  label: "Percent (A / B × 100)"  },
  { key: "concat",   label: "Concatenate (text join)" },
]

const BINARY_ONLY = ["subtract", "divide", "percent"]

function fmtN(n: number) {
  return Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
}

function getStats(rows: any[], columns: any[], colName: string) {
  const idx = columns.findIndex((c: any) => c.name === colName)
  if (idx < 0) return null
  const nums = rows.map((r: any) => Number(r[idx])).filter(n => isFinite(n))
  if (!nums.length) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const sum = nums.reduce((a, b) => a + b, 0)
  const avg = sum / nums.length
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
  return {
    sum: fmtN(sum),
    avg: fmtN(avg),
    median: fmtN(median),
    min: fmtN(Math.min(...nums)),
    max: fmtN(Math.max(...nums)),
  }
}

interface Props { widget: TableWidget }

export default function TableProperties({ widget }: Props) {

  const dataset = useDashboardStore(s => s.dashboard.dataset)
  const updateWidget = useDashboardStore(s => s.updateWidget)
  const [open, setOpen] = useState("columns")

  function toggle(s: string) { setOpen(prev => prev === s ? "" : s) }
  function upd(field: string, val: any) { updateWidget({ ...widget, [field]: val } as any) }

  if (!dataset) {
    return <div style={{ padding: "16px 14px", fontSize: 12, color: "var(--text3)" }}>Upload a dataset first.</div>
  }

  function toggleColumn(col: string) {
    const cols = widget.columns.includes(col)
      ? widget.columns.filter(c => c !== col)
      : [...widget.columns, col]
    upd("columns", cols)
  }

  // ── Computed columns helpers ──
  const computedCols: ComputedColumn[] = widget.computedColumns || []

  function addComputed() {
    const defA = (dataset!.columns[0] as any)?.name || ""
    const defB = (dataset!.columns[1] as any)?.name || defA
    const nc: ComputedColumn = {
      id: generateId("cc"),
      name: "Computed",
      formula: "add",
      operands: [defA, defB],
    }
    upd("computedColumns", [...computedCols, nc])
  }

  function updComputed(id: string, patch: Partial<ComputedColumn>) {
    upd("computedColumns", computedCols.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  function delComputed(id: string) {
    upd("computedColumns", computedCols.filter(c => c.id !== id))
  }

  // ── Numeric columns for stats ──
  const numericCols = widget.columns.filter(col => {
    const idx = (dataset!.columns as any[]).findIndex((c: any) => c.name === col)
    return idx >= 0 && (dataset!.rows as any[]).some((r: any) => isFinite(Number(r[idx])))
  })

  // ── Chevron SVG ──
  function Chevron({ name }: { name: string }) {
    return (
      <svg
        className={`pp-chevron${open === name ? " open" : ""}`}
        width="12" height="12" viewBox="0 0 12 12"
      >
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  return (
    <div className="pp-table-panel">

      {/* ── COLUMNS ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("columns")}>
          <span>Columns</span>
          <Chevron name="columns" />
        </div>
        {open === "columns" && (
          <div className="pp-collapse-body">
            <div className="table-columns-list">
              {(dataset.columns as any[]).map((col: any) => (
                <div
                  key={col.name}
                  className={`table-column-chip${widget.columns.includes(col.name) ? " active" : ""}`}
                  onClick={() => toggleColumn(col.name)}
                >
                  {col.name}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              <label className="pp-checkbox-row">
                <input
                  type="checkbox"
                  checked={!!widget.showRowNumbers}
                  onChange={e => upd("showRowNumbers", e.target.checked)}
                />
                <span className="pp-label">Row numbers</span>
              </label>
              <label className="pp-checkbox-row">
                <input
                  type="checkbox"
                  checked={!!widget.showStatsRow}
                  onChange={e => upd("showStatsRow", e.target.checked)}
                />
                <span className="pp-label">Show totals row  (Σ)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── THEME ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("theme")}>
          <span>Theme</span>
          <Chevron name="theme" />
        </div>
        {open === "theme" && (
          <div className="pp-collapse-body">
            <div className="theme-cards">
              {THEMES.map(t => (
                <div
                  key={t.key}
                  className={`theme-card${(widget.theme || "default") === t.key ? " active" : ""}`}
                  onClick={() => upd("theme", t.key)}
                >
                  <div className="theme-preview">
                    <div
                      className="theme-prev-header"
                      style={{ background: t.hBg || "#f4f6f9" }}
                    >
                      <div style={{
                        background: t.hFg,
                        opacity: .75,
                        height: 4,
                        width: "72%",
                        borderRadius: 2,
                      }} />
                    </div>
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="theme-prev-row"
                        style={{ background: i % 2 === 1 && t.stripe ? t.stripe : "transparent" }}
                      >
                        <span style={{
                          background: "#bcc5d0",
                          height: 3,
                          width: ["65%", "80%", "55%"][i],
                          borderRadius: 2,
                          display: "block",
                        }} />
                      </div>
                    ))}
                  </div>
                  <div className="theme-label">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── COMPUTED COLUMNS ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("computed")}>
          <span>Computed Columns</span>
          <Chevron name="computed" />
        </div>
        {open === "computed" && (
          <div className="pp-collapse-body">
            {computedCols.length === 0 && (
              <div className="pp-empty-hint">No computed columns yet.</div>
            )}
            {computedCols.map(col => (
              <div key={col.id} className="computed-col-card">
                <div className="computed-col-header">
                  <input
                    className="pp-input"
                    value={col.name}
                    onChange={e => updComputed(col.id, { name: e.target.value })}
                    placeholder="Column name"
                  />
                  <button className="cc-del-btn" onClick={() => delComputed(col.id)}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="pp-row" style={{ marginTop: 6 }}>
                  <label className="pp-label">Formula</label>
                  <select
                    className="pp-select"
                    value={col.formula}
                    onChange={e => updComputed(col.id, { formula: e.target.value as any })}
                  >
                    {FORMULAS.map(f => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div className="pp-label" style={{ marginBottom: 5 }}>Inputs</div>
                  {col.operands.map((op, oi) => (
                    <div key={oi} className="operand-row">
                      <select
                        className="pp-select"
                        value={op}
                        onChange={e => {
                          const ops = col.operands.map((o, ii) => ii === oi ? e.target.value : o)
                          updComputed(col.id, { operands: ops })
                        }}
                      >
                        {(dataset.columns as any[]).map((c: any) => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      {!BINARY_ONLY.includes(col.formula) && col.operands.length > 2 && (
                        <button
                          className="op-remove-btn"
                          onClick={() => {
                            const ops = col.operands.filter((_, ii) => ii !== oi)
                            updComputed(col.id, { operands: ops })
                          }}
                        >−</button>
                      )}
                    </div>
                  ))}
                  {!BINARY_ONLY.includes(col.formula) && (
                    <button
                      className="op-add-btn"
                      onClick={() => {
                        const def = (dataset!.columns[0] as any)?.name || ""
                        updComputed(col.id, { operands: [...col.operands, def] })
                      }}
                    >+ Add column</button>
                  )}
                </div>
              </div>
            ))}

            <button className="add-computed-btn" onClick={addComputed}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Add Computed Column
            </button>
          </div>
        )}
      </div>

      {/* ── COLUMN STATS ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("stats")}>
          <span>Column Stats</span>
          <Chevron name="stats" />
        </div>
        {open === "stats" && (
          <div className="pp-collapse-body">
            {numericCols.length === 0 && (
              <div className="pp-empty-hint">Select numeric columns to see stats.</div>
            )}
            {numericCols.map(col => {
              const s = getStats(dataset.rows as any[], dataset.columns as any[], col)
              if (!s) return null
              return (
                <div key={col} className="col-stats-card">
                  <div className="col-stats-name">{col}</div>
                  <div className="col-stats-grid">
                    <div className="col-stat"><span className="stat-label">Sum</span><span className="stat-val">{s.sum}</span></div>
                    <div className="col-stat"><span className="stat-label">Avg</span><span className="stat-val">{s.avg}</span></div>
                    <div className="col-stat"><span className="stat-label">Med</span><span className="stat-val">{s.median}</span></div>
                    <div className="col-stat"><span className="stat-label">Min</span><span className="stat-val">{s.min}</span></div>
                    <div className="col-stat"><span className="stat-label">Max</span><span className="stat-val">{s.max}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}