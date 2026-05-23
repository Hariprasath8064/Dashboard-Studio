import { useState } from "react"

interface Props {
  executedQuery: string
  rowCount?: number
  executionMs?: number
  fetchedAt?: string
  /** Shown in Fields panel vs widget properties */
  compact?: boolean
}

export default function BigfixQueryView({
  executedQuery,
  rowCount,
  executionMs,
  fetchedAt,
  compact = false,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const q = executedQuery?.trim()
  if (!q) return null

  return (
    <div className={`bf-query-view${expanded ? " bf-query-view--expanded" : ""}${compact ? " bf-query-view--compact" : ""}`}>
      <div className="bf-query-view-head">
        <span className="bf-query-view-title">Query sent to BigFix</span>
        {rowCount != null && (
          <span className="bf-query-view-meta">
            {rowCount} rows{executionMs != null ? ` · ${executionMs}ms` : ""}
          </span>
        )}
        {fetchedAt && (
          <span className="bf-query-view-meta">{new Date(fetchedAt).toLocaleString()}</span>
        )}
      </div>
      <p className="bf-query-view-hint">
        This is the exact relevance expression posted to Web Reports when you clicked Fetch data.
      </p>
      <pre className="bf-query-view-code">{q}</pre>
      <div className="bf-query-view-actions">
        <button
          type="button"
          className="bf-query-action"
          onClick={() => navigator.clipboard.writeText(q)}
        >
          Copy query
        </button>
        <button
          type="button"
          className="bf-query-action"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
    </div>
  )
}
