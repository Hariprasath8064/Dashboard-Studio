// Sub-panel: numeric column statistics for TableProperties

function fmtN(n: number) {
  return Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
}

function getStats(rows: any[], columns: any[], colName: string) {
  const idx  = columns.findIndex((c: any) => c.name === colName)
  if (idx < 0) return null
  const nums = rows.map((r: any) => Number(r[idx])).filter(n => isFinite(n))
  if (!nums.length) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const sum    = nums.reduce((a, b) => a + b, 0)
  const avg    = sum / nums.length
  const mid    = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
  return {
    sum: fmtN(sum), avg: fmtN(avg), median: fmtN(median),
    min: fmtN(Math.min(...nums)), max: fmtN(Math.max(...nums)),
  }
}

interface Props {
  numericCols: string[]
  rows: any[]
  columns: any[]
}

export default function StatsPanel({ numericCols, rows, columns }: Props) {
  if (numericCols.length === 0) {
    return <div className="pp-empty-hint">Select numeric columns to see stats.</div>
  }
  return (
    <>
      {numericCols.map(col => {
        const s = getStats(rows, columns, col)
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
    </>
  )
}
