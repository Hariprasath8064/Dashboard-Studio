import { useState } from "react"
import type { TableWidget, ComputedColumn } from "../types/widgetTypes"
import { useDashboardStore } from "../store/dashboardStore"
import { useWidgetDataset } from "../hooks/useWidgetDataset"
import { generateId } from "../utils/id"
import ThemePanel           from "./table/ThemePanel"
import ColumnsPanel         from "./table/ColumnsPanel"
import ComputedColumnsPanel from "./table/ComputedColumnsPanel"
import StatsPanel           from "./table/StatsPanel"

interface Props { widget: TableWidget }

export default function TableProperties({ widget }: Props) {

  const dataset      = useWidgetDataset(widget)
  const updateWidget = useDashboardStore(s => s.updateWidget)
  const [open, setOpen] = useState("columns")

  function toggle(s: string) { setOpen(prev => prev === s ? "" : s) }
  function upd(field: string, val: any) { updateWidget({ ...widget, [field]: val } as any) }

  if (!dataset) {
    return <div style={{ padding: "16px 14px", fontSize: 12, color: "var(--text3)" }}>Upload a dataset first.</div>
  }

  // ── Computed columns helpers ──
  const computedCols: ComputedColumn[] = widget.computedColumns || []

  function addComputed() {
    const defA = (dataset!.columns[0] as any)?.name || ""
    const defB = (dataset!.columns[1] as any)?.name || defA
    upd("computedColumns", [...computedCols, {
      id: generateId("cc"), name: "Computed", formula: "add", operands: [defA, defB],
    }])
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

  function Chevron({ name }: { name: string }) {
    return (
      <svg className={`pp-chevron${open === name ? " open" : ""}`} width="12" height="12" viewBox="0 0 12 12">
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
    )
  }

  return (
    <div className="pp-table-panel">

      {/* ── COLUMNS ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("columns")}>
          <span>Columns</span><Chevron name="columns" />
        </div>
        {open === "columns" && (
          <div className="pp-collapse-body">
            <ColumnsPanel
              allColumns={dataset.columns as any[]}
              selectedColumns={widget.columns}
              showRowNumbers={!!widget.showRowNumbers}
              showStatsRow={!!widget.showStatsRow}
              onToggleColumn={col => {
                const cols = widget.columns.includes(col)
                  ? widget.columns.filter(c => c !== col)
                  : [...widget.columns, col]
                upd("columns", cols)
              }}
              onToggleRowNumbers={val => upd("showRowNumbers", val)}
              onToggleStatsRow={val => upd("showStatsRow", val)}
            />
          </div>
        )}
      </div>

      {/* ── THEME ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("theme")}>
          <span>Theme</span><Chevron name="theme" />
        </div>
        {open === "theme" && (
          <div className="pp-collapse-body">
            <ThemePanel
              theme={widget.theme || "default"}
              onThemeChange={key => upd("theme", key)}
            />
          </div>
        )}
      </div>

      {/* ── COMPUTED COLUMNS ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("computed")}>
          <span>Computed Columns</span><Chevron name="computed" />
        </div>
        {open === "computed" && (
          <div className="pp-collapse-body">
            <ComputedColumnsPanel
              computedCols={computedCols}
              allColumns={dataset.columns as any[]}
              onAdd={addComputed}
              onUpdate={updComputed}
              onDelete={delComputed}
            />
          </div>
        )}
      </div>

      {/* ── COLUMN STATS ── */}
      <div className="pp-collapsible">
        <div className="pp-collapse-header" onClick={() => toggle("stats")}>
          <span>Column Stats</span><Chevron name="stats" />
        </div>
        {open === "stats" && (
          <div className="pp-collapse-body">
            <StatsPanel
              numericCols={numericCols}
              rows={dataset.rows as any[]}
              columns={dataset.columns as any[]}
            />
          </div>
        )}
      </div>

    </div>
  )
}