import type { BigfixSchema } from "../types/bigfixTypes"
import type { Dataset, DatasetColumn } from "../types/datasetTypes"

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8081/api"

export async function fetchInspectorSchema(): Promise<BigfixSchema> {
  const res = await fetch(`${BASE_URL}/inspectors`)
  if (!res.ok) throw new Error(`Failed to fetch BigFix schema: ${res.statusText}`)
  return res.json()
}

export async function fetchSites(): Promise<Array<{ name: string; isOperator: boolean }>> {
  const res = await fetch(`${BASE_URL}/sites`)
  if (!res.ok) throw new Error(`Failed to fetch BigFix sites: ${res.statusText}`)
  return res.json()
}

export interface StructuredQueryResult {
  data: string[][]
  generatedQuery: string
  rowCount?: number
  executionTimeMs?: number
}

export async function executeStructuredQuery(
  objectType: string,
  selectedProps: string[],
  sites: string[] = []
): Promise<StructuredQueryResult> {
  const res = await fetch(`${BASE_URL}/query-structured`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectType, selectedProps, filters: [], filterLogic: "AND", sites }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.details || err.error || res.statusText)
  }
  const result = await res.json()
  return {
    data: result.data as string[][],
    generatedQuery: result.generatedQuery ?? "",
    rowCount: result.rowCount,
    executionTimeMs: result.executionTimeMs,
  }
}

export async function previewStructuredQuery(
  objectType: string,
  selectedProps: string[],
  sites: string[] = []
): Promise<string> {
  const res = await fetch(`${BASE_URL}/query-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectType, selectedProps, filters: [], filterLogic: "AND", sites }),
  })
  if (!res.ok) throw new Error(`Preview failed: ${res.statusText}`)
  const result = await res.json()
  return result.generatedQuery ?? ""
}

/** Clean up raw BigFix values (URL-encoded noise, <none>, etc.) */
export function cleanBigfixValue(val: any): string {
  if (val == null || val === "<none>" || val === "") return "Unknown"
  return String(val)
    .replace(/(%0A|%0a)+/g, ", ")
    .replace(/(%20)+/g, " ")
    .trim()
}

/**
 * Convert raw BigFix query results into the standard Dataset format
 * so all widgets can consume the data exactly like Excel-loaded data.
 *
 * If no metric is selected, the dimension values are counted and the
 * resulting dataset has columns: [dimensionName, "Record Count", ...extras]
 *
 * If a metric is selected, each BigFix row becomes one dataset row:
 * [dimValue, metricValue, ...extraValues]
 */
export function bigfixRawToDataset(
  rawData: string[][],
  propsToFetch: string[],
  dimension: string,
  metric: string,
  additionalProps: string[],
  schema: BigfixSchema,
  objectType: string
): Dataset {
  const props = schema.properties[objectType] ?? []

  function getPropName(path: string): string {
    const found = props.find(p => p.relevancePath === path)
    return found ? found.name : path
  }

  function getPropType(path: string): "number" | "string" {
    const found = props.find(p => p.relevancePath === path)
    if (!found) return "string"
    const dt = found.dataType?.toLowerCase() ?? ""
    return (dt === "integer" || dt === "decimal" || dt === "number") ? "number" : "string"
  }

  const dimName = getPropName(dimension)
  const metName = metric ? getPropName(metric) : "Record Count"

  // Build column definitions
  const columns: DatasetColumn[] = [
    { name: dimName, type: "string" },
    { name: metName, type: "number" },
  ]
  for (const ap of additionalProps) {
    const n = getPropName(ap)
    if (!columns.some(c => c.name === n)) {
      columns.push({ name: n, type: getPropType(ap) })
    }
  }

  // Build rows
  let rows: (string | number)[][] = []

  if (!metric) {
    // Count occurrences — group by dimension value
    const counts: Map<string, number> = new Map()
    const extraPropsMap: Map<string, (string | number)[]> = new Map()

    for (const row of rawData) {
      const dimVal = cleanBigfixValue(row[0])
      counts.set(dimVal, (counts.get(dimVal) ?? 0) + 1)

      if (!extraPropsMap.has(dimVal)) {
        const extras: (string | number)[] = additionalProps.map(ap => {
          const idx = propsToFetch.indexOf(ap)
          const raw = idx !== -1 ? cleanBigfixValue(row[idx]) : "Unknown"
          return getPropType(ap) === "number" ? (isNaN(Number(raw)) ? 0 : Number(raw)) : raw
        })
        extraPropsMap.set(dimVal, extras)
      }
    }

    rows = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([dimVal, count]) => [
        dimVal,
        count,
        ...(extraPropsMap.get(dimVal) ?? []),
      ])

  } else {
    // One row per BigFix object
    rows = rawData.map(row => {
      const dimVal  = cleanBigfixValue(row[0])
      const rawMet  = cleanBigfixValue(row[1])
      const metVal  = isNaN(Number(rawMet)) ? 0 : Number(rawMet)
      const extras: (string | number)[] = additionalProps.map(ap => {
        const idx = propsToFetch.indexOf(ap)
        const raw = idx !== -1 ? cleanBigfixValue(row[idx]) : "Unknown"
        return getPropType(ap) === "number" ? (isNaN(Number(raw)) ? 0 : Number(raw)) : raw
      })
      return [dimVal, metVal, ...extras]
    })
  }

  return { columns, rows }
}
