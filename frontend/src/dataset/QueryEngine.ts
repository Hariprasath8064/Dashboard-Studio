import type { Dataset, AggregationType } from "../types/datasetTypes"

export function runAggregation(
  dataset: Dataset,
  xColumn: string,
  yColumn: string,
  aggregation: AggregationType
) {

  if (!xColumn || !yColumn) {
    return {
      labels: [],
      values: []
    }
  }

  const xIndex = dataset.columns.findIndex((c) => c.name === xColumn)
  const yIndex = dataset.columns.findIndex((c) => c.name === yColumn)

  if (xIndex === -1 || yIndex === -1) {
    return {
      labels: [],
      values: []
    }
  }

  const groups: Record<string, number[]> = {}

  dataset.rows.forEach((row) => {

    const key = String(row[xIndex])
    const value = Number(row[yIndex])

    if (!groups[key]) {
      groups[key] = []
    }

    groups[key].push(value)

  })

  const labels: string[] = []
  const values: number[] = []

  Object.entries(groups).forEach(([label, nums]) => {

    labels.push(label)

    values.push(
      applyAggregation(nums, aggregation)
    )

  })

  return {
    labels,
    values
  }

}

function applyAggregation(nums: number[], type: AggregationType) {

  switch (type) {

    case "SUM":
      return nums.reduce((a, b) => a + b, 0)

    case "AVG":
      return nums.reduce((a, b) => a + b, 0) / nums.length

    case "COUNT":
      return nums.length

    case "MIN":
      return Math.min(...nums)

    case "MAX":
      return Math.max(...nums)

    default:
      return 0
  }

}