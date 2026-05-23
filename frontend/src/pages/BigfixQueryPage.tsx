import { useEffect, useMemo, useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"

export default function BigfixQueryPage() {
  const bigfixMode             = useDashboardStore(s => s.dashboard.bigfixMode)
  const sources                = useDashboardStore(s => s.bigfixDataSources)
  const activeDataSourceId     = useDashboardStore(s => s.activeDataSourceId)
  const queryEditorSourceId    = useDashboardStore(s => s.queryEditorSourceId)
  const setQueryEditorSourceId = useDashboardStore(s => s.setQueryEditorSourceId)

  const selectedId = queryEditorSourceId ?? activeDataSourceId ?? sources[0]?.id ?? ""
  const source     = sources.find(s => s.id === selectedId)

  const [draft, setDraft] = useState("")
  const [copied, setCopied] = useState(false)

  const queryText = source?.generatedQuery?.trim() ?? ""

  useEffect(() => {
    setDraft(queryText)
  }, [queryText, selectedId])

  const lineCount = useMemo(() => {
    if (!draft) return 0
    return draft.split("\n").length
  }, [draft])

  async function handleCopy() {
    if (!draft) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* ignore */
    }
  }

  if (!bigfixMode) {
    return (
      <div className="code-view">
        <div className="query-editor query-editor--empty">
          <p>BigFix mode is not enabled for this dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="code-view">
      <div className="query-editor">
        <div className="code-preview-toolbar query-editor-toolbar">
          <span>BigFix relevance</span>
          {sources.length > 0 && (
            <select
              className="query-editor-source-select"
              value={selectedId}
              onChange={e => setQueryEditorSourceId(e.target.value)}
            >
              {sources.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.dataset?.rows.length ?? 0} rows)
                </option>
              ))}
            </select>
          )}
          <div style={{ flex: 1 }} />
          {source?.fetchedAt && (
            <span className="query-editor-meta">
              Fetched {new Date(source.fetchedAt).toLocaleString()}
            </span>
          )}
          <button
            type="button"
            className={`code-preview-copy${copied ? " copied" : ""}`}
            onClick={handleCopy}
            disabled={!draft}
          >
            {copied ? "✓ Copied" : "Copy query"}
          </button>
        </div>

        {!source || !queryText ? (
          <div className="query-editor-empty-body">
            <h2>No query yet</h2>
            <p>
              Build a fetch in the <strong>Fields</strong> panel (Design view) and click{" "}
              <strong>Fetch Data from BigFix</strong>. The exact relevance sent to Web Reports
              will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="query-editor-notice">
              <span className="query-editor-notice-badge">Read-only</span>
              Generated from the Fields panel. Direct edit and run will be added here later.
            </div>
            <div className="query-editor-main">
              <div className="query-editor-gutter" aria-hidden>
                {draft.split("\n").map((_, i) => (
                  <span key={i} className="query-editor-line-num">{i + 1}</span>
                ))}
              </div>
              <textarea
                className="query-editor-textarea"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                readOnly
                spellCheck={false}
                aria-label="BigFix relevance query"
                placeholder="Query will appear after you fetch data from BigFix…"
              />
            </div>
            <div className="query-editor-footer">
              <span>{lineCount} lines</span>
              {source.queryConfig?.objectType && (
                <span>Object: {source.queryConfig.objectType}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
