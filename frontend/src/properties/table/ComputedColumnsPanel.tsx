// Sub-panel: computed (formula) columns for TableProperties

import type { ComputedColumn } from "../../types/widgetTypes"

const FORMULAS = [
  { key: "add",      label: "Add (A + B + …)"        },
  { key: "subtract", label: "Subtract (A − B)"        },
  { key: "multiply", label: "Multiply (A × B × …)"   },
  { key: "divide",   label: "Divide (A ÷ B)"          },
  { key: "percent",  label: "Percent (A / B × 100)"  },
  { key: "concat",   label: "Concatenate (text join)" },
]

const BINARY_ONLY = ["subtract", "divide", "percent"]

interface Props {
  computedCols: ComputedColumn[]
  allColumns: any[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<ComputedColumn>) => void
  onDelete: (id: string) => void
}

export default function ComputedColumnsPanel({ computedCols, allColumns, onAdd, onUpdate, onDelete }: Props) {
  return (
    <>
      {computedCols.length === 0 && (
        <div className="pp-empty-hint">No computed columns yet.</div>
      )}

      {computedCols.map(col => (
        <div key={col.id} className="computed-col-card">
          <div className="computed-col-header">
            <input
              className="pp-input"
              value={col.name}
              onChange={e => onUpdate(col.id, { name: e.target.value })}
              placeholder="Column name"
            />
            <button className="cc-del-btn" onClick={() => onDelete(col.id)}>
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
              onChange={e => onUpdate(col.id, { formula: e.target.value as any })}
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
                    onUpdate(col.id, { operands: ops })
                  }}
                >
                  {allColumns.map((c: any) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {!BINARY_ONLY.includes(col.formula) && col.operands.length > 2 && (
                  <button
                    className="op-remove-btn"
                    onClick={() => {
                      const ops = col.operands.filter((_, ii) => ii !== oi)
                      onUpdate(col.id, { operands: ops })
                    }}
                  >−</button>
                )}
              </div>
            ))}
            {!BINARY_ONLY.includes(col.formula) && (
              <button
                className="op-add-btn"
                onClick={() => {
                  const def = (allColumns[0] as any)?.name || ""
                  onUpdate(col.id, { operands: [...col.operands, def] })
                }}
              >+ Add column</button>
            )}
          </div>
        </div>
      ))}

      <button className="add-computed-btn" onClick={onAdd}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Add Computed Column
      </button>
    </>
  )
}
