import type { BigfixSchema, BigfixQueryConfig } from "../types/bigfixTypes"
import type { Dataset } from "../types/datasetTypes"
import { executeStructuredQuery, bigfixRawToDataset } from "../services/bigfixApi"
import { buildPropsToFetch } from "./bigfixQueryUtils"

export interface BigfixFetchResult {
  dataset: Dataset
  generatedQuery: string
  rowCount: number
  executionTimeMs?: number
}

export async function runBigfixFetch(
  queryConfig: BigfixQueryConfig,
  schema: BigfixSchema,
): Promise<BigfixFetchResult> {
  const propsToFetch = buildPropsToFetch(queryConfig)
  const { objectType, dimension, metric = "", additionalProps = [], sites = [] } = queryConfig

  const result = await executeStructuredQuery(objectType, propsToFetch, sites)
  const dataset = bigfixRawToDataset(
    result.data,
    propsToFetch,
    dimension,
    metric,
    additionalProps,
    schema,
    objectType,
  )

  return {
    dataset,
    generatedQuery: result.generatedQuery,
    rowCount: result.rowCount ?? result.data.length,
    executionTimeMs: result.executionTimeMs,
  }
}
