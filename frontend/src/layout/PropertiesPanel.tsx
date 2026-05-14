import { useEffect, useMemo, useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"

import ChartProperties from "../properties/ChartProperties"
import TextProperties  from "../properties/TextProperties"
import TableProperties from "../properties/TableProperties"
import KPIProperties   from "../properties/KPIProperties"

import StylePanel  from "../properties/panels/StylePanel"
import LayoutPanel from "../properties/panels/LayoutPanel"
import DatasetFields from "../sidebar/DatasetFields"
import { executeStructuredQuery, bigfixRawToDataset } from "../services/bigfixApi"
import type { BigfixQueryConfig } from "../types/bigfixTypes"
import { EMPTY_BIGFIX_QUERY } from "../types/bigfixTypes"
import type {
 Widget,
 TextWidget,
 TableWidget,
 KPIWidget,
 ChartWidget
} from "../types/widgetTypes"

const TYPE_LABELS: Record<string, string> = {
 bar: "Bar Chart",
 line: "Line Chart",
 area: "Area Chart",
 "stacked-bar": "Stacked Bar",
 scatter: "Scatter",
 radar: "Radar",
 donut: "Donut Chart",
 pie: "Pie Chart",
 gauge: "Gauge",
 timeline: "Timeline",
 kpi: "KPI Card",
 table: "Table",
 text: "Text"
}

const BG_PRESETS = ["#ffffff","#f4f6f9","#f0f4ff","#f0fff4","#fff7f0","#fdf4ff","#1b2230","#0f172a"]

function CanvasProperties() {

 const canvas      = useDashboardStore(s => s.dashboard.canvas)
 const background  = useDashboardStore(s => s.dashboard.background)
 const updateCanvas = useDashboardStore(s => s.updateCanvas)
 const setCanvasBg  = useDashboardStore(s => s.setCanvasBg)

 const bgColor = background?.color || "#f4f6f9"

 return (
  <div className="pp-scroll">

   <div className="pp-group">
    <div className="pp-group-label">Dimensions</div>

    <div className="pp-row">
     <span className="pp-label">Width</span>
     <input
      className="pp-input"
      type="number"
      min={400} max={3000} step={10}
      value={canvas.width}
      onChange={e => updateCanvas({ width: Math.max(400, Number(e.target.value)) })}
     />
    </div>

    <div className="pp-row">
     <span className="pp-label">Height</span>
     <input
      className="pp-input"
      type="number"
      min={300} max={3000} step={10}
      value={canvas.height}
      onChange={e => updateCanvas({ height: Math.max(300, Number(e.target.value)) })}
     />
    </div>
   </div>

   <div className="pp-group">
    <div className="pp-group-label">Background</div>

    <div className="pp-row">
     <span className="pp-label">Color</span>
     <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
      <div className="canvas-bg-swatch" style={{ background: bgColor }}>
       <input
        type="color"
        value={bgColor}
        onChange={e => setCanvasBg({ color: e.target.value, image: "" })}
       />
      </div>
      <input
       className="pp-input"
       value={bgColor}
       onChange={e => setCanvasBg({ color: e.target.value })}
       style={{ flex:1, fontFamily:"var(--mono)", fontSize:11 }}
       maxLength={7}
      />
     </div>
    </div>

    <div style={{ display:"flex", flexWrap:"wrap", gap:5, padding:"4px 0 8px 0" }}>
     {BG_PRESETS.map(c => (
      <div
       key={c}
       className={`pp-swatch${bgColor === c ? " sel" : ""}`}
       style={{ background: c, border: c === "#ffffff" ? "1px solid var(--border)" : undefined }}
       title={c}
       onClick={() => setCanvasBg({ color: c, image: "" })}
      />
     ))}
    </div>

   </div>

  </div>
 )
}

// ── BigFix query builder shown in Fields panel ──────────────

function BigfixQueryBuilder() {

 // ── ALL hooks must be called unconditionally, before any early returns ──
 const bigfixSchema         = useDashboardStore(s => s.bigfixSchema)
 const savedConfig          = useDashboardStore(s => s.dashboard.bigfixQueryConfig)
 const setBigfixQueryConfig = useDashboardStore(s => s.setBigfixQueryConfig)
 const setDataset           = useDashboardStore(s => s.setDataset)
 const dataset              = useDashboardStore(s => s.dashboard.dataset)

 const [cfg, setCfg]               = useState<BigfixQueryConfig>(savedConfig ?? EMPTY_BIGFIX_QUERY)
 const [sites]                     = useState<string[]>([])
 const [fetching, setFetching]     = useState(false)
 const [fetchError, setFetchError] = useState<string | null>(null)
 const [search, setSearch]         = useState("")

 // Keep local state in sync when saved config changes externally
 useEffect(() => {
  if (savedConfig) setCfg(savedConfig)
 }, [savedConfig])

 // Stats derived from the current dataset (must be before any early return)
 const stats = useMemo(() => {
  if (!dataset) return null
  const dims    = dataset.columns.filter(c => c.type !== "number").length
  const metrics = dataset.columns.filter(c => c.type === "number").length
  return { total: dataset.columns.length, rows: dataset.rows.length, dims, metrics }
 }, [dataset])

 // ── Early return AFTER all hooks ──
 if (!bigfixSchema) {
  return (
   <div className="fp-empty" style={{ padding: "16px 14px" }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
     <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <span>BigFix schema not loaded.<br/>Check backend connection.</span>
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
   const propsToFetch = [cfg.dimension]
   if (cfg.metric) propsToFetch.push(cfg.metric)
   cfg.additionalProps.forEach(ap => {
    if (!propsToFetch.includes(ap)) propsToFetch.push(ap)
   })

   const rawData = await executeStructuredQuery(cfg.objectType, propsToFetch, cfg.sites)
   const ds = bigfixRawToDataset(rawData, propsToFetch, cfg.dimension, cfg.metric, cfg.additionalProps, bigfixSchema!, cfg.objectType)

   setBigfixQueryConfig(cfg)
   setDataset(ds, `BigFix: ${cfg.objectType}`, null)
  } catch (err: any) {
   setFetchError(String(err?.message ?? err))
  } finally {
   setFetching(false)
  }
 }

 const canFetch = !fetching && !!cfg.objectType && !!cfg.dimension

 return (
  <div className="pp-scroll">
   <div style={{ padding: "10px 14px 0" }}>

    {/* Object Type */}
    <div className="bf-query-section">
     <div className="bf-query-label">Object Type</div>
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

    {/* Dimension (Group By) */}
    {cfg.objectType && (
     <div className="bf-query-section">
      <div className="bf-query-label">
       Dimension
       <span className="bf-query-badge bf-badge-dim">group by</span>
      </div>
      <select
       className="pp-select"
       value={cfg.dimension}
       onChange={e => update({ dimension: e.target.value })}
      >
       <option value="">Select dimension…</option>
       {objectProps.map(p => (
        <option key={p.relevancePath} value={p.relevancePath}>{p.name}</option>
       ))}
      </select>
     </div>
    )}

    {/* Metric (optional) */}
    {cfg.objectType && cfg.dimension && (
     <div className="bf-query-section">
      <div className="bf-query-label">
       Metric
       <span className="bf-query-badge bf-badge-metric">value</span>
       <span style={{ fontSize: 10, color: "var(--text3)", marginLeft: "auto" }}>optional</span>
      </div>
      <select
       className="pp-select"
       value={cfg.metric}
       onChange={e => update({ metric: e.target.value })}
      >
       <option value="">Count occurrences</option>
       {numericProps.map(p => (
        <option key={p.relevancePath} value={p.relevancePath}>{p.name}</option>
       ))}
      </select>
     </div>
    )}

    {/* Additional Properties */}
    {cfg.objectType && cfg.dimension && (
     <div className="bf-query-section">
      <div className="bf-query-label">
       Additional Properties
       {cfg.additionalProps.length > 0 && (
        <span className="bf-query-badge" style={{ background: "#e0f2fe", color: "#0369a1" }}>{cfg.additionalProps.length}</span>
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

    {/* Sites filter */}
    {cfg.objectType && cfg.dimension && bigfixSchema && (
     <div className="bf-query-section">
      <div className="bf-query-label">
       Sites
       <span style={{ fontSize: 10, color: "var(--text3)", marginLeft: "auto" }}>all if none selected</span>
      </div>
      {sites.length === 0 ? (
       <div style={{ fontSize: 11, color: "var(--text3)", padding: "4px 0" }}>
        Sites will load after first fetch, or select sites from the backend.
       </div>
      ) : (
       <div className="bf-prop-list">
        {sites.map(site => (
         <label key={site} className="bf-prop-item">
          <input
           type="checkbox"
           checked={cfg.sites.includes(site)}
           onChange={() => toggleSite(site)}
          />
          <span className="bf-prop-name">{site}</span>
         </label>
        ))}
       </div>
      )}
     </div>
    )}

    {/* Error */}
    {fetchError && (
     <div className="bf-fetch-error">{fetchError}</div>
    )}

    {/* Fetch button */}
    <button
     className={`bf-fetch-btn${canFetch ? "" : " disabled"}`}
     onClick={fetchData}
     disabled={!canFetch}
    >
     {fetching ? (
      <>
       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: "spin .8s linear infinite" }}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round"/>
       </svg>
       Fetching…
      </>
     ) : (
      <>
       <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
       </svg>
       Fetch Data from BigFix
      </>
     )}
    </button>

   </div>

   {/* Fields list — shown once data is fetched */}
   {dataset && stats && (
    <>
     <div style={{ padding: "10px 14px 0", borderTop: "1px solid var(--border)", marginTop: 10 }}>
      <div className="fp-dataset-card">
       <div className="fp-dataset-name">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
         <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
         <path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/>
         <path d="M4 2v3M8 2v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
        </svg>
        BigFix: {cfg.objectType || "Dataset"}
       </div>
       <div className="fp-stat-row">
        <span className="fp-stat"><b>{stats.rows}</b> rows</span>
        <span className="fp-stat-sep">·</span>
        <span className="fp-stat fp-stat-dim"><b>{stats.dims}</b> dim</span>
        <span className="fp-stat-sep">·</span>
        <span className="fp-stat fp-stat-metric"><b>{stats.metrics}</b> metric</span>
       </div>
      </div>

      <div className="fp-search-wrap">
       <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="fp-search-icon">
        <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
       </svg>
       <input
        className="fp-search"
        placeholder="Search fields…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
       />
       {search && <button className="fp-search-clear" onClick={() => setSearch("")}>×</button>}
      </div>
      <div className="fp-hint">Drag a field onto a widget or the canvas</div>
     </div>
     <div style={{ padding: "0 14px 12px" }}>
      <DatasetFields search={search} />
     </div>
    </>
   )}
  </div>
 )
}

// ── Excel/CSV fields view ────────────────────────────────

function ExcelFieldsContent() {

 const dataset     = useDashboardStore((s) => s.dashboard.dataset)
 const datasetName = useDashboardStore((s) => s.datasetName)
 const [search, setSearch] = useState("")

 const stats = useMemo(() => {
  if (!dataset) return null
  const dims    = dataset.columns.filter((c) => c.type !== "number").length
  const metrics = dataset.columns.filter((c) => c.type === "number").length
  return { total: dataset.columns.length, rows: dataset.rows.length, dims, metrics }
 }, [dataset])

 if (!dataset || !stats) {
  return (
   <div className="pp-scroll">
    <div className="fp-empty">
     <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 11h20" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10 6v5M18 6v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
     </svg>
     <span>Load a dataset in the<br/>Data tab to see fields</span>
    </div>
   </div>
  )
 }

 return (
  <div className="pp-scroll">
   <div style={{ padding: "10px 14px 0" }}>

    <div className="fp-dataset-card">
     <div className="fp-dataset-name" title={datasetName || ""}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
       <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
       <path d="M1 5h10" stroke="currentColor" strokeWidth="1.1"/>
       <path d="M4 2v3M8 2v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      {datasetName || "Dataset"}
     </div>
     <div className="fp-stat-row">
      <span className="fp-stat"><b>{stats.rows}</b> rows</span>
      <span className="fp-stat-sep">·</span>
      <span className="fp-stat fp-stat-dim"><b>{stats.dims}</b> dim</span>
      <span className="fp-stat-sep">·</span>
      <span className="fp-stat fp-stat-metric"><b>{stats.metrics}</b> metric</span>
     </div>
    </div>

    <div className="fp-search-wrap">
     <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="fp-search-icon">
      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
     </svg>
     <input
      className="fp-search"
      placeholder="Search fields…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
     />
     {search && (
      <button className="fp-search-clear" onClick={() => setSearch("")}>×</button>
     )}
    </div>

    <div className="fp-hint">Drag a field onto the canvas or a widget</div>
   </div>

   <div style={{ padding: "0 14px 12px" }}>
    <DatasetFields search={search} />
   </div>
  </div>
 )
}

function FieldsContent() {
 const bigfixMode = useDashboardStore(s => s.dashboard.bigfixMode ?? false)
 return bigfixMode ? <BigfixQueryBuilder /> : <ExcelFieldsContent />
}

export default function PropertiesPanel(){

 const widgets    = useDashboardStore(s => s.dashboard.widgets)
 const selectedId = useDashboardStore(s => s.selectedWidgetId)

 const widget = widgets.find(w => w.id === selectedId)

 const [tab, setTab]   = useState("data")
 const [view, setView] = useState<"properties"|"fields">("fields")

 // Auto-switch: show Properties when a widget is selected, Fields when deselected
 useEffect(() => {
  setView(selectedId ? "properties" : "fields")
 }, [selectedId])

 const isTextWidget  = (w: Widget): w is TextWidget  => w.type === "text"
 const isTableWidget = (w: Widget): w is TableWidget => w.type === "table"
 const isKPIWidget   = (w: Widget): w is KPIWidget   => w.type === "kpi"
 const isChartWidget = (w: Widget): w is ChartWidget =>
  w.type === "bar" || w.type === "line" || w.type === "donut" ||
  w.type === "area" || w.type === "stacked-bar" || w.type === "scatter" ||
  w.type === "radar" ||
  w.type === "pie" || w.type === "gauge" || w.type === "timeline"

 function renderDataPanel(widget: Widget){
  if(isTextWidget(widget))  return <TextProperties  widget={widget} />
  if(isTableWidget(widget)) return <TableProperties widget={widget} />
  if(isKPIWidget(widget))   return <KPIProperties   widget={widget} />
  if(isChartWidget(widget)) return <ChartProperties widget={widget} />
  return null
 }

 return(
  <div id="props-panel">

   {/* Top-level view switcher */}
   <div className="rp-view-tabs">
    <button className={view==="fields"     ? "active" : ""} onClick={()=>setView("fields")}>Fields</button>
    <button className={view==="properties" ? "active" : ""} onClick={()=>setView("properties")}>Properties</button>
   </div>

   {/* ── Fields view ── */}
   {view==="fields" && <FieldsContent />}

   {/* ── Properties view ── */}
   {view==="properties" && (
    <>
     {!widget ? (
      <>
       <div className="pp-header">Canvas</div>
       <CanvasProperties />
      </>
     ) : (
      <>
       <div className="pp-header">
        Properties
        <span className="pp-badge">{TYPE_LABELS[widget.type] || widget.type}</span>
       </div>

       <div className="props-tabs">
        <button className={tab==="data"   ? "active":""} onClick={()=>setTab("data")}>Data</button>
        <button className={tab==="style"  ? "active":""} onClick={()=>setTab("style")}>Style</button>
        <button className={tab==="layout" ? "active":""} onClick={()=>setTab("layout")}>Layout</button>
       </div>

       <div className="pp-scroll">
        {tab==="data"   && renderDataPanel(widget)}
        {tab==="style"  && <StylePanel  widget={widget} />}
        {tab==="layout" && <LayoutPanel widget={widget} />}
       </div>
      </>
     )}
    </>
   )}

  </div>
 )
}

