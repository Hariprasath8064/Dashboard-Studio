import { useEffect, useMemo, useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import DatasetFields from "../sidebar/DatasetFields"
import { runBigfixFetch } from "../utils/bigfixFetch"
import { datasetApi } from "../services/datasetApi"
import type { BigfixQueryConfig } from "../types/bigfixTypes"
import { EMPTY_BIGFIX_QUERY } from "../types/bigfixTypes"

function BigfixQueryBuilder() {
  const bigfixSchema         = useDashboardStore(s => s.bigfixSchema)
  const savedConfig          = useDashboardStore(s => s.dashboard.bigfixQueryConfig)
  const setBigfixQueryConfig = useDashboardStore(s => s.setBigfixQueryConfig)
  const addBigfixDataSource  = useDashboardStore(s => s.addBigfixDataSource)
  const dataset              = useDashboardStore(s =>
    (s.activeDataSourceId
      ? s.bigfixDataSources.find(x => x.id === s.activeDataSourceId)?.dataset
      : s.bigfixDataSources[0]?.dataset) ?? s.dashboard.dataset,
  )

  const [cfg, setCfg]               = useState<BigfixQueryConfig>(savedConfig ?? EMPTY_BIGFIX_QUERY)
  const [sites]                     = useState<string[]>([])
  const [fetching, setFetching]     = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch]         = useState("")

  useEffect(() => {
    if (savedConfig) setCfg(savedConfig)
  }, [savedConfig])

  const stats = useMemo(() => {
    if (!dataset) return null
    const dims    = dataset.columns.filter(c => c.type !== "number").length
    const metrics = dataset.columns.filter(c => c.type === "number").length
    return { rows: dataset.rows.length, dims, metrics }
  }, [dataset])

  if (!bigfixSchema) {
    return (
      <div className="panel-empty panel-empty--sm">
        <p>Enable BigFix on the <strong>Data</strong> tab and connect, then build your query here.</p>
      </div>
    )
  }

  const objectProps  = cfg.objectType ? (bigfixSchema.properties[cfg.objectType] ?? []) : []
  const numericProps = objectProps.filter(p => {
    const dt = p.dataType?.toLowerCase() ?? ""
    return dt === "integer" || dt === "decimal" || dt === "number"
  })

  function update(patch: Partial<BigfixQueryConfig>) {
    setCfg(prev => ({ ...prev, ...patch }))
  }

  function toggleAdditionalProp(path: string) {
    const next = cfg.additionalProps.includes(path)
      ? cfg.additionalProps.filter(p => p !== path)
      : [...cfg.additionalProps, path]
    update({ additionalProps: next })
  }

  function toggleSite(name: string) {
    const next = cfg.sites.includes(name)
      ? cfg.sites.filter(s => s !== name)
      : [...cfg.sites, name]
    update({ sites: next })
  }

  async function fetchData() {
    if (!cfg.objectType || !cfg.dimension) return
    setFetching(true)
    setFetchError(null)
    try {
      const { dataset: ds, generatedQuery } = await runBigfixFetch(cfg, bigfixSchema!)
      setBigfixQueryConfig(cfg)
      let datasetId: string | null = null
      const name = `BigFix: ${cfg.objectType} (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
      try {
        const saved = await datasetApi.save(name, ds)
        datasetId = saved.id
      } catch { /* offline */ }
      addBigfixDataSource({ queryConfig: cfg, dataset: ds, generatedQuery, datasetId, name })
    } catch (err: unknown) {
      setFetchError(String((err as Error)?.message ?? err))
    } finally {
      setFetching(false)
    }
  }

  const canFetch = !fetching && !!cfg.objectType && !!cfg.dimension

  return (
    <div className="panel-tab-inner">
      <div className="bf-query-section">
        <div className="bf-query-label">Object type</div>
        <select
          className="pp-select"
          value={cfg.objectType}
          onChange={e => update({ objectType: e.target.value, dimension: "", metric: "", additionalProps: [] })}
        >
          <option value="">Select object type…</option>
          {bigfixSchema.objectsList.map(obj => (
            <option key={obj} value={obj}>{obj}</option>
          ))}
        </select>
      </div>

      {cfg.objectType && (
        <div className="bf-query-section">
          <div className="bf-query-label">
            Dimension
            <span className="bf-query-badge bf-badge-dim">group by</span>
          </div>
          <select className="pp-select" value={cfg.dimension} onChange={e => update({ dimension: e.target.value })}>
            <option value="">Select dimension…</option>
            {objectProps.map(p => (
              <option key={p.relevancePath} value={p.relevancePath}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {cfg.objectType && cfg.dimension && (
        <div className="bf-query-section">
          <div className="bf-query-label">
            Metric
            <span className="bf-query-badge bf-badge-metric">value</span>
            <span className="bf-query-label-hint">optional</span>
          </div>
          <select className="pp-select" value={cfg.metric} onChange={e => update({ metric: e.target.value })}>
            <option value="">Count occurrences</option>
            {numericProps.map(p => (
              <option key={p.relevancePath} value={p.relevancePath}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {cfg.objectType && cfg.dimension && (
        <div className="bf-query-section">
          <div className="bf-query-label">
            Additional properties
            {cfg.additionalProps.length > 0 && (
              <span className="bf-query-badge bf-query-badge--count">{cfg.additionalProps.length}</span>
            )}
          </div>
          <div className="bf-prop-list">
            {objectProps
              .filter(p => p.relevancePath !== cfg.dimension && p.relevancePath !== cfg.metric)
              .map(p => (
                <label key={p.relevancePath} className="bf-prop-item">
                  <input
                    type="checkbox"
                    checked={cfg.additionalProps.includes(p.relevancePath)}
                    onChange={() => toggleAdditionalProp(p.relevancePath)}
                  />
                  <span className={`bf-prop-type ${numericProps.some(n => n.relevancePath === p.relevancePath) ? "bf-prop-num" : "bf-prop-str"}`}>
                    {numericProps.some(n => n.relevancePath === p.relevancePath) ? "#" : "T"}
                  </span>
                  <span className="bf-prop-name">{p.name}</span>
                </label>
              ))}
          </div>
        </div>
      )}

      {cfg.objectType && cfg.dimension && sites.length > 0 && (
        <div className="bf-query-section">
          <div className="bf-query-label">
            Sites
            <span className="bf-query-label-hint">all if none</span>
          </div>
          <div className="bf-prop-list">
            {sites.map(site => (
              <label key={site} className="bf-prop-item">
                <input type="checkbox" checked={cfg.sites.includes(site)} onChange={() => toggleSite(site)} />
                <span className="bf-prop-name">{site}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {fetchError && <div className="bf-fetch-error">{fetchError}</div>}

      <button className={`bf-fetch-btn${canFetch ? "" : " disabled"}`} onClick={fetchData} disabled={!canFetch}>
        {fetching ? "Fetching…" : "Fetch data from BigFix"}
      </button>

      {dataset && stats && (
        <div className="fields-list-block">
          <div className="fp-dataset-card">
            <div className="fp-dataset-name">BigFix: {cfg.objectType || "Dataset"}</div>
            <div className="fp-stat-row">
              <span className="fp-stat"><b>{stats.rows}</b> rows</span>
              <span className="fp-stat-sep">·</span>
              <span className="fp-stat fp-stat-dim"><b>{stats.dims}</b> dimensions</span>
              <span className="fp-stat-sep">·</span>
              <span className="fp-stat fp-stat-metric"><b>{stats.metrics}</b> metrics</span>
            </div>
          </div>
          <div className="fp-search-wrap">
            <input
              className="fp-search"
              placeholder="Search fields…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button type="button" className="fp-search-clear" onClick={() => setSearch("")}>×</button>}
          </div>
          <p className="fp-hint">Drag fields onto a widget or the canvas.</p>
          <DatasetFields search={search} />
        </div>
      )}
    </div>
  )
}

function ExcelFieldsContent() {
  const dataset     = useDashboardStore(s => s.dashboard.dataset)
  const datasetName = useDashboardStore(s => s.datasetName)
  const [search, setSearch] = useState("")

  const stats = useMemo(() => {
    if (!dataset) return null
    const dims    = dataset.columns.filter(c => c.type !== "number").length
    const metrics = dataset.columns.filter(c => c.type === "number").length
    return { rows: dataset.rows.length, dims, metrics }
  }, [dataset])

  if (!dataset || !stats) {
    return (
      <div className="panel-empty">
        <p className="panel-empty-desc">Load a dataset on the <strong>Data</strong> tab to see fields here.</p>
      </div>
    )
  }

  return (
    <div className="panel-tab-inner">
      <div className="fp-dataset-card">
        <div className="fp-dataset-name">{datasetName || "Dataset"}</div>
        <div className="fp-stat-row">
          <span className="fp-stat"><b>{stats.rows}</b> rows</span>
          <span className="fp-stat-sep">·</span>
          <span className="fp-stat fp-stat-dim"><b>{stats.dims}</b> dimensions</span>
          <span className="fp-stat-sep">·</span>
          <span className="fp-stat fp-stat-metric"><b>{stats.metrics}</b> metrics</span>
        </div>
      </div>
      <div className="fp-search-wrap">
        <input
          className="fp-search"
          placeholder="Search fields…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button type="button" className="fp-search-clear" onClick={() => setSearch("")}>×</button>}
      </div>
      <p className="fp-hint">Drag fields onto a widget or the canvas.</p>
      <DatasetFields search={search} />
    </div>
  )
}

export default function FieldsPanel() {
  const bigfixMode = useDashboardStore(s => s.dashboard.bigfixMode ?? false)
  return bigfixMode ? <BigfixQueryBuilder /> : <ExcelFieldsContent />
}
