import { readSheet } from "read-excel-file/browser"
import type { Dataset } from "../types/datasetTypes"

export async function parseExcel(file: File): Promise<Dataset> {
  
  const rows = await readSheet(file, 1)

  if (!rows || rows.length < 2) {
    throw new Error("Excel file is empty or has no data rows")
  }

  const headers = rows[0].map((h) => String(h ?? ""))
  const dataRows = rows.slice(1)

  const columns = headers.map((name, i) => ({
    name,
    type: detectType(dataRows[0]?.[i]) as any,
  }))

  return {
    columns,
    rows: dataRows.map((row) => headers.map((_, i) => row[i] ?? null)),
  }

}

function detectType(value: unknown) {
  if (typeof value === "number") return "number"
  if (value instanceof Date)     return "date"
  return "string"
}
