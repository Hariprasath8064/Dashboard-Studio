// Sub-panel: column visibility + row options for TableProperties

interface Props {
  allColumns: any[]
  selectedColumns: string[]
  showRowNumbers: boolean
  showStatsRow: boolean
  onToggleColumn: (col: string) => void
  onToggleRowNumbers: (val: boolean) => void
  onToggleStatsRow: (val: boolean) => void
}

export default function ColumnsPanel({
  allColumns, selectedColumns,
  showRowNumbers, showStatsRow,
  onToggleColumn, onToggleRowNumbers, onToggleStatsRow
}: Props) {
  return (
    <>
      <div className="table-columns-list">
        {allColumns.map((col: any) => (
          <div
            key={col.name}
            className={`table-column-chip${selectedColumns.includes(col.name) ? " active" : ""}`}
            onClick={() => onToggleColumn(col.name)}
          >
            {col.name}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
        <label className="pp-checkbox-row">
          <input type="checkbox" checked={showRowNumbers}
            onChange={e => onToggleRowNumbers(e.target.checked)} />
          <span className="pp-label">Row numbers</span>
        </label>
        <label className="pp-checkbox-row">
          <input type="checkbox" checked={showStatsRow}
            onChange={e => onToggleStatsRow(e.target.checked)} />
          <span className="pp-label">Show totals row (Σ)</span>
        </label>
      </div>
    </>
  )
}
