import * as XLSX from "xlsx"
import type { Dataset } from "../types/datasetTypes"

export async function parseExcel(file: File): Promise<Dataset> {

  const data = await file.arrayBuffer()

  const workbook = XLSX.read(data)

  const sheetName = workbook.SheetNames[0]

  const sheet = workbook.Sheets[sheetName]

  const json: any[] = XLSX.utils.sheet_to_json(sheet)

  if (!json.length) {
    throw new Error("Excel file is empty")
  }

  const columns = Object.keys(json[0]).map((name) => ({
    name,
    type: detectType(json[0][name]) as any
  }))

  const rows = json.map((row) => columns.map((col) => row[col.name]))

  return {
    columns,
    rows
  }

}

function detectType(value: any) {

  if (typeof value === "number") return "number"

  if (value instanceof Date) return "date"

  return "string"

}