import type { Dataset } from "../types/datasetTypes"
import { evaluateBigfixQuery } from "../services/bigfixApi"
import { rawBigfixToDataset } from "./rawBigfixToDataset"

export interface CustomQueryResult {
  dataset: Dataset
  generatedQuery: string
  rowCount: number
  executionTimeMs?: number
}

export async function runCustomBigfixQuery(query: string): Promise<CustomQueryResult> {
  const trimmed = query.trim()
  if (!trimmed) throw new Error("Query is empty.")

  const result = await evaluateBigfixQuery(trimmed, true)
  const dataset = rawBigfixToDataset(result.data, trimmed)

  return {
    dataset,
    generatedQuery: trimmed,
    rowCount: result.rowCount ?? result.data.length,
    executionTimeMs: result.executionTimeMs,
  }
}
