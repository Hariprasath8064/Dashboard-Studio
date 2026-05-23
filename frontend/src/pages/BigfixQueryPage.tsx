import { useEffect, useState } from "react"
import SyntaxEditor from "../components/SyntaxEditor"
import { useDashboardStore } from "../store/dashboardStore"

const NEW_SOURCE = "__new__"

export default function BigfixQueryPage() {
  const bigfixMode          = useDashboardStore(s => s.dashboard.bigfixMode)
  const sources             = useDashboardStore(s => s.bigfixDataSources)
  const queryEditorSourceId = useDashboardStore(s => s.queryEditorSourceId)
  const setQueryEditorSourceId = useDashboardStore(s => s.setQueryEditorSourceId)
  const runQueryOnSource    = useDashboardStore(s => s.runQueryOnSource)

  const [draft, setDraft]       = useState("")
  const [running, setRunning]   = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const [pickId, setPickId]     = useState(
    queryEditorSourceId ?? sources[0]?.id ?? NEW_SOURCE,
  )

  const source = pickId !== NEW_SOURCE ? sources.find(s => s.id === pickId) : undefined

  useEffect(() => {
    if (queryEditorSourceId) setPickId(queryEditorSourceId)
  }, [queryEditorSourceId])

  useEffect(() => {
    if (pickId === NEW_SOURCE) return
    const q = source?.generatedQuery ?? ""
    setDraft(q)
    setRunError(null)
  }, [pickId, source?.generatedQuery])

  async function handleRun() {
    const q = draft.trim()
    if (!q) {
      setRunError("Enter a relevance query.")
      return
    }
    setRunning(true)
    setRunError(null)
    try {
      const targetId = pickId === NEW_SOURCE ? null : pickId
      const newId = await runQueryOnSource(targetId, q)
      setPickId(newId)
      setQueryEditorSourceId(newId)
    } catch (err: unknown) {
      setRunError(String((err as Error)?.message ?? err))
    } finally {
      setRunning(false)
    }
  }

  async function handleCopy() {
    if (!draft.trim()) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch { /* ignore */ }
  }

  if (!bigfixMode) {
    return (
      <div className="code-view">
        <div className="query-editor query-editor--empty">
          <p>BigFix mode is not enabled.</p>
        </div>
      </div>
    )
  }

  const rowCount = source?.dataset?.rows.length

  return (
    <div className="code-view">
      <div className="query-editor">
        <div className="code-preview-toolbar query-editor-toolbar">
          <span>BigFix relevance</span>
          <select
            className="query-editor-source-select"
            value={pickId}
            onChange={e => {
              setPickId(e.target.value)
              if (e.target.value !== NEW_SOURCE) {
                setQueryEditorSourceId(e.target.value)
              }
            }}
          >
            <option value={NEW_SOURCE}>+ New query</option>
            {sources.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.dataset?.rows.length ?? 0} rows)
              </option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          {rowCount != null && pickId !== NEW_SOURCE && (
            <span className="query-editor-meta">{rowCount} rows</span>
          )}
          <button
            type="button"
            className={`code-preview-copy${copied ? " copied" : ""}`}
            onClick={handleCopy}
            disabled={!draft.trim()}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            type="button"
            className="code-preview-copy query-run-btn"
            onClick={handleRun}
            disabled={running || !draft.trim()}
          >
            {running ? "Running…" : "Run query"}
          </button>
        </div>

        {runError && <div className="query-editor-error">{runError}</div>}

        <SyntaxEditor
          value={draft}
          onChange={setDraft}
          language="relevance"
          placeholder="(name of it, id of it) of bes computers"
          ariaLabel="BigFix relevance query"
        />
      </div>
    </div>
  )
}
