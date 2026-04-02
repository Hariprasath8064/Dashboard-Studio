import type { Dataset } from "../types/datasetTypes"

export async function parseCSV(file: File): Promise<Dataset> {

  const text = await file.text()

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  if (!lines.length) {
    throw new Error("CSV file is empty")
  }

  const headers = lines[0].split(",")

  const columns = headers.map((h) => ({
    name: h,
    type: "string" as const
  }))

  const rows = lines.slice(1).map((line) => {

    const parts = line.split(",")

    return parts.map((v) => {

      const num = Number(v)

      if (!isNaN(num)) return num

      return v

    })

  })

  return {
    columns,
    rows
  }

}