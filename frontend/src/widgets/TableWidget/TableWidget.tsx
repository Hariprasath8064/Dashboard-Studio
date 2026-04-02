import { useDashboardStore } from "../../store/dashboardStore"
import type { TableWidget as TableType, ComputedColumn } from "../../types/widgetTypes"

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
}

function computeCell(row: any[], columns: any[], col: ComputedColumn): string {
  const vals = col.operands.map(op => {
    const idx = columns.findIndex((c: any) => c.name === op)
    return idx >= 0 ? row[idx] : null
  })
  switch (col.formula) {
    case "add": {
      const nums = vals.map(Number)
      if (nums.some(isNaN)) return ""
      return fmt(nums.reduce((a, b) => a + b, 0))
    }
    case "subtract": {
      const [a, b] = vals.map(Number)
      return isNaN(a) || isNaN(b) ? "" : fmt(a - b)
    }
    case "multiply": {
      const nums = vals.map(Number)
      if (nums.some(isNaN)) return ""
      return fmt(nums.reduce((a, b) => a * b, 1))
    }
    case "divide": {
      const [a, b] = vals.map(Number)
      return isNaN(a) || isNaN(b) || b === 0 ? "" : fmt(a / b)
    }
    case "percent": {
      const [a, b] = vals.map(Number)
      return isNaN(a) || isNaN(b) || b === 0 ? "" : fmt(a / b * 100) + "%"
    }
    case "concat":
      return vals.map(v => String(v ?? "")).join(" ")
    default:
      return ""
  }
}

function colSum(rows: any[], columns: any[], colName: string): string {
  const idx = columns.findIndex((c: any) => c.name === colName)
  if (idx < 0) return ""
  const nums = rows.map((r: any) => Number(r[idx])).filter(n => isFinite(n))
  if (!nums.length) return ""
  return fmt(nums.reduce((a, b) => a + b, 0))
}

interface Props { widget: TableType }

export default function TableWidget({ widget }: Props) {

  const dataset = useDashboardStore(s => s.dashboard.dataset)
  const theme = widget.theme || "default"
  const computedCols = widget.computedColumns || []

  if (!dataset) {
    return (
      <div className="table-inner">
        <div className="table-empty">No dataset loaded</div>
      </div>
    )
  }

  if (!widget.columns.length && !computedCols.length) {
    return (
      <div className="table-inner">
        <div className="table-empty">Select columns in Properties → Data</div>
      </div>
    )
  }

  const { rows, columns } = dataset

  return (
    <div className={`table-inner tw-${theme}`}>
      <div className="table-scroll">
        <table className="tw-table">
          <thead>
            <tr>
              {widget.showRowNumbers && <th style={{ width: 32, textAlign: "center" }}>#</th>}
              {widget.columns.map(col => <th key={col}>{col}</th>)}
              {computedCols.map(col => <th key={col.id}>{col.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {(rows as any[]).map((row, i) => (
              <tr key={i}>
                {widget.showRowNumbers && (
                  <td style={{ width: 32, textAlign: "center", color: "#9ca3af" }}>{i + 1}</td>
                )}
                {widget.columns.map(col => {
                  const idx = (columns as any[]).findIndex((c: any) => c.name === col)
                  return <td key={col}>{idx >= 0 ? String(row[idx] ?? "") : ""}</td>
                })}
                {computedCols.map(col => (
                  <td key={col.id}>{computeCell(row as any[], columns as any[], col)}</td>
                ))}
              </tr>
            ))}
            {widget.showStatsRow && (rows as any[]).length > 0 && (
              <tr className="tw-stats-row">
                {widget.showRowNumbers && <td />}
                {widget.columns.map(col => (
                  <td key={col}>{colSum(rows as any[], columns as any[], col)}</td>
                ))}
                {computedCols.map(col => <td key={col.id} />)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

}