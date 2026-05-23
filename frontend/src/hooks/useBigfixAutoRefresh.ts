import { useEffect, useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"

export type RefreshStatus = "idle" | "refreshing" | "done" | "error"

export function useBigfixAutoRefresh() {
  const bigfixMode                = useDashboardStore(s => s.dashboard.bigfixMode)
  const bigfixSchema              = useDashboardStore(s => s.bigfixSchema)
  const bigfixDataSources         = useDashboardStore(s => s.bigfixDataSources)
  const bigfixPendingRefresh      = useDashboardStore(s => s.bigfixPendingRefresh)
  const setBigfixPendingRefresh   = useDashboardStore(s => s.setBigfixPendingRefresh)
  const refreshAllBigfixDataSources = useDashboardStore(s => s.refreshAllBigfixDataSources)
  const setBigfixFetchedAt        = useDashboardStore(s => s.setBigfixFetchedAt)

  const [status, setStatus] = useState<RefreshStatus>("idle")

  async function refresh() {
    if (!bigfixMode || !bigfixSchema || bigfixDataSources.length === 0) return

    setStatus("refreshing")
    try {
      await refreshAllBigfixDataSources(bigfixSchema)
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

  useEffect(() => {
    if (!bigfixPendingRefresh || !bigfixSchema || status === "refreshing") return
    if (bigfixDataSources.length === 0) {
      setBigfixPendingRefresh(false)
      return
    }
    refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bigfixPendingRefresh, bigfixSchema, bigfixDataSources.length])

  return { status, refresh }
}
