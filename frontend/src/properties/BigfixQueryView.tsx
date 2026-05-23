import { useEffect, useState } from "react"
import type { BigfixQueryConfig } from "../types/bigfixTypes"
import { previewStructuredQuery } from "../services/bigfixApi"
import { buildPropsToFetch } from "../utils/bigfixQueryUtils"

interface Props {
  title: string
  queryConfig?: BigfixQueryConfig
  executedQuery?: string
  live?: boolean
  rowCount?: number
  executionMs?: number
  fetchedAt?: string
}

export default function BigfixQueryView({
  title,
  queryConfig,
  executedQuery,
  live = false,
  rowCount,
  executionMs,
  fetchedAt,
}: Props) {
  const [preview, setPreview] = useState("")
  const [previewError, setPreviewError] = useState<string | null>(null)

  const displayQuery = executedQuery || preview

  useEffect(() => {
    if (!live || !queryConfig?.objectType || !queryConfig.dimension) {
      setPreview("")
      return
    }
    const props = buildPropsToFetch(queryConfig)
    if (!props.length) return

    let cancelled = false
    const t = window.setTimeout(async () => {
      try {
        const q = await previewStructuredQuery(queryConfig.objectType, props, queryConfig.sites)
        if (!cancelled) {
          setPreview(q)
          setPreviewError(null)
        }
      } catch (e: any) {
        if (!cancelled) {
          setPreview("")
          setPreviewError(String(e?.message ?? e))
        }
      }
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [live, queryConfig?.objectType, queryConfig?.dimension, queryConfig?.metric, queryConfig?.additionalProps, queryConfig?.sites])

  if (!displayQuery && !previewError && !live) return null

  return (
    <div className="bf-query-view">
      <div className="bf-query-view-head">
        <span className="bf-query-view-title">{title}</span>
        {executedQuery && rowCount != null && (
          <span className="bf-query-view-meta">{rowCount} rows{executionMs != null ? ` · ${executionMs}ms` : ""}</span>
        )}
        {fetchedAt && (
          <span className="bf-query-view-meta">{new Date(fetchedAt).toLocaleString()}</span>
        )}
      </div>
      {previewError && live && (
        <div className="bf-query-view-err">{previewError}</div>
      )}
      <pre className="bf-query-view-code">{displayQuery || (live ? "Configure object type and dimension…" : "")}</pre>
      {displayQuery && (
        <button
          type="button"
          className="bf-query-copy"
          onClick={() => navigator.clipboard.writeText(displayQuery)}
        >
          Copy query
        </button>
      )}
    </div>
  )
}
