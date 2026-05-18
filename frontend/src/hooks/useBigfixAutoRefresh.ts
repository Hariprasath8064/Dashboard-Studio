import { useEffect, useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import { executeStructuredQuery, bigfixRawToDataset } from "../services/bigfixApi"
import { datasetApi } from "../services/datasetApi"

export type RefreshStatus = "idle" | "refreshing" | "done" | "error"

export function useBigfixAutoRefresh() {
  const bigfixMode             = useDashboardStore(s => s.dashboard.bigfixMode)
  const bigfixQueryConfig      = useDashboardStore(s => s.dashboard.bigfixQueryConfig)
  const bigfixSchema           = useDashboardStore(s => s.bigfixSchema)
  const savedDatasetId         = useDashboardStore(s => s.savedDatasetId)
  const setDataset             = useDashboardStore(s => s.setDataset)
  const setSavedDatasetId      = useDashboardStore(s => s.setSavedDatasetId)
  const setBigfixFetchedAt     = useDashboardStore(s => s.setBigfixFetchedAt)
  const bigfixPendingRefresh   = useDashboardStore(s => s.bigfixPendingRefresh)
  const setBigfixPendingRefresh = useDashboardStore(s => s.setBigfixPendingRefresh)

  const [status, setStatus] = useState<RefreshStatus>("idle")

  async function refresh() {
    if (!bigfixMode || !bigfixQueryConfig?.objectType || !bigfixQueryConfig?.dimension || !bigfixSchema) return

    setStatus("refreshing")
    try {
      const { objectType, dimension, metric = "", additionalProps = [], sites = [] } = bigfixQueryConfig

      const propsToFetch = [dimension]
      if (metric) propsToFetch.push(metric)
      additionalProps.forEach(ap => { if (!propsToFetch.includes(ap)) propsToFetch.push(ap) })

      const rawData = await executeStructuredQuery(objectType, propsToFetch, sites)
      const ds = bigfixRawToDataset(rawData, propsToFetch, dimension, metric, additionalProps, bigfixSchema, objectType)

      const name = `BigFix: ${objectType}`
      let datasetId = savedDatasetId
      try {
        const saved = await datasetApi.save(name, ds)
        datasetId = saved.id
        setSavedDatasetId(saved.id)
      } catch { /* backend offline — continue in-memory */ }

      setDataset(ds, name, datasetId)
      setBigfixFetchedAt(new Date().toISOString())
      setStatus("done")
      setTimeout(() => setStatus("idle"), 4000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 6000)
    } finally {
      setBigfixPendingRefresh(false)
    }
  }

  // Auto-refresh fires once when the schema becomes available after a dashboard load
  useEffect(() => {
    if (!bigfixPendingRefresh || !bigfixSchema || status === "refreshing") return
    refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bigfixPendingRefresh, bigfixSchema])

  return { status, refresh }
}
