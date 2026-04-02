import { parseExcel } from "../dataset/ExcelParser"
import { parseCSV } from "../dataset/CSVParser"
import type { Dataset } from "../types/datasetTypes"

export async function loadDataset(file: File): Promise<Dataset> {

  const name = file.name.toLowerCase()

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseExcel(file)
  }

  if (name.endsWith(".csv")) {
    return parseCSV(file)
  }

  throw new Error("Unsupported file format")

}