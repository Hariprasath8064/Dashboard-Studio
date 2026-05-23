import type { Dataset, DatasetColumn } from "../types/datasetTypes"

function inferCellType(values: string[]): "number" | "string" {
  if (values.length === 0) return "string"
  const numeric = values.filter(v => v !== "" && !Number.isNaN(Number(v)))
  return numeric.length >= values.length * 0.8 ? "number" : "string"
}

/** Turn raw BigFix evaluate rows into a widget-ready dataset. */
export function rawBigfixToDataset(data: string[][]): Dataset {
  if (!data.length) {
    return { columns: [{ name: "value", type: "string" }], rows: [] }
  }

  const colCount = Math.max(...data.map(r => r.length), 1)
  const columns: DatasetColumn[] = []

  for (let c = 0; c < colCount; c++) {
    const colValues = data.map(row => String(row[c] ?? "").trim())
    const type = inferCellType(colValues)
    columns.push({
      name: colCount === 1 ? "value" : `Column ${c + 1}`,
      type,
    })
  }

  const rows = data.map(row => {
    const cells: (string | number)[] = []
    for (let c = 0; c < colCount; c++) {
      const raw = String(row[c] ?? "").trim()
      if (columns[c].type === "number") {
        const n = Number(raw)
        cells.push(Number.isNaN(n) ? 0 : n)
      } else {
        cells.push(raw)
      }
    }
    return cells
  })

  return { columns, rows }
}
