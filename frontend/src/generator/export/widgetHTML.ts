export function renderWidgetHTML(widget: any, columns: any[], rows: any[]): string {

  const left   = widget?.position?.x ?? 0
  const top    = widget?.position?.y ?? 0
  const width  = widget?.size?.width ?? 320
  const height = widget?.size?.height ?? 220
  const zIndex = widget?.zIndex ?? 1
  const frameStyle = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;z-index:${zIndex};`

  switch (widget?.type) {
    case "bar":
    case "line":
    case "area":
    case "stacked-bar":
    case "scatter":
    case "radar":
    case "donut":
    case "pie":
    case "gauge":
    case "timeline":
      return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="chart-inner">
      <div class="wg-title">${escapeHtml(widget?.title || "Chart")}</div>
      <canvas id="chart-${widget?.id}"></canvas>
     </div>
    </div>
   </div>
   `

    case "kpi": {
      const kpiColor    = widget?.color ? `color:${widget.color};` : ""
      const kpiFontSize = `font-size:${widget?.fontSize ?? 36}px;`
      const prefix      = escapeHtml(widget?.prefix || "")
      const suffix      = escapeHtml(widget?.suffix || "")
      const mainVal     = buildKpiValue(widget, columns, rows)
      const deltaHtml   = buildKpiDelta(widget, columns, rows)
      return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="kpi-inner">
      <div class="kpi-label-txt">${escapeHtml(widget?.label || "KPI")}</div>
      <div class="kpi-val" style="${kpiColor}${kpiFontSize}">${prefix}${mainVal}${suffix}</div>
      ${deltaHtml}
     </div>
    </div>
   </div>
   `
    }

    case "text": {
      const hStyle = [
        `font-size:${widget?.headingSize ?? 18}px`,
        `font-weight:${widget?.headingBold   ? 700 : 500}`,
        `font-style:${widget?.headingItalic  ? "italic" : "normal"}`,
        `text-align:${widget?.headingAlign   || "left"}`,
        widget?.headingColor ? `color:${widget.headingColor}` : "color:#1b1f24",
        widget?.headingFont  ? `font-family:${widget.headingFont}` : "",
        "line-height:1.3",
        "margin-bottom:6px",
      ].filter(Boolean).join(";")

      const bStyle = [
        `font-size:${widget?.bodySize ?? 13}px`,
        `font-weight:${widget?.bodyBold      ? 700 : 400}`,
        `font-style:${widget?.bodyItalic     ? "italic" : "normal"}`,
        `text-decoration:${widget?.bodyUnderline ? "underline" : "none"}`,
        `text-align:${widget?.bodyAlign      || "left"}`,
        widget?.bodyColor ? `color:${widget.bodyColor}` : "color:#5a5f66",
        widget?.bodyFont  ? `font-family:${widget.bodyFont}` : "",
        "line-height:1.6",
      ].filter(Boolean).join(";")

      return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="text-inner">
      <div class="text-wg-h1" style="${hStyle}">${escapeHtml(widget?.heading || "Heading")}</div>
      <div class="text-wg-p"  style="${bStyle}">${escapeHtml(widget?.body || "")}</div>
     </div>
    </div>
   </div>
   `
    }

    case "table": {
      const tableHtml = buildTable(widget, columns, rows)
      return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     ${tableHtml}
    </div>
   </div>
   `
    }

    case "image": {
      const src     = widget?.src     || ""
      const fit     = widget?.fit     || "cover"
      const opacity = (widget?.opacity ?? 100) / 100
      const alt     = escapeHtml(widget?.alt || "")
      if (!src) {
        return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="img-placeholder">No image</div>
    </div>
   </div>
   `
      }
      return `
   <div class="widget" style="${frameStyle}">
    <div class="widget-inner">
     <div class="img-inner">
      <img src="${src}" alt="${alt}" style="width:100%;height:100%;object-fit:${fit};opacity:${opacity};display:block;" />
     </div>
    </div>
   </div>
   `
    }

    default:
      return ""
  }
}

function kpiAggregate(nums: number[], agg: string): number | null {
  if (!nums.length) return null
  switch ((agg || "SUM").toUpperCase()) {
    case "AVG":   return nums.reduce((a, b) => a + b, 0) / nums.length
    case "COUNT": return nums.length
    case "MIN":   return Math.min(...nums)
    case "MAX":   return Math.max(...nums)
    default:      return nums.reduce((a, b) => a + b, 0)
  }
}

function kpiFormatNum(value: number, fmt: string | undefined, decimals: number): string {
  const d   = decimals ?? 0
  const abs = Math.abs(value)
  const f   = fmt ?? "auto"
  if (f === "full") return value.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
  if (f === "b" || (f === "auto" && abs >= 1_000_000_000)) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
  if (f === "m" || (f === "auto" && abs >= 1_000_000))     return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  if (f === "k" || (f === "auto" && abs >= 10_000))        return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  return value.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
}

function getColNums(columns: any[], rows: any[], colName: string): number[] {
  const idx = columns.findIndex((c: any) => c?.name === colName)
  if (idx < 0) return []
  return rows.map((r: any) => Number(r?.[idx])).filter((n: number) => Number.isFinite(n))
}

function buildKpiValue(widget: any, columns: any[], rows: any[]): string {
  if (!columns.length || !rows.length) return "--"
  const nums   = getColNums(columns, rows, widget?.valueColumn)
  const result = kpiAggregate(nums, widget?.aggregation)
  if (result === null) return "--"
  return kpiFormatNum(result, widget?.numberFormat, widget?.decimals ?? 0)
}

function buildKpiDelta(widget: any, columns: any[], rows: any[]): string {
  const cmpType = widget?.comparisonType ?? "none"
  if (cmpType === "none") return ""
  if (!columns.length || !rows.length) return ""

  const primaryNums = getColNums(columns, rows, widget?.valueColumn)
  const primaryRaw  = kpiAggregate(primaryNums, widget?.aggregation)
  if (primaryRaw === null) return ""

  let cmpRaw: number | null = null
  if (cmpType === "column" && widget?.comparisonColumn) {
    const cmpNums = getColNums(columns, rows, widget.comparisonColumn)
    cmpRaw = kpiAggregate(cmpNums, widget?.aggregation)
  } else if (cmpType === "target" && widget?.comparisonTarget != null) {
    cmpRaw = Number(widget.comparisonTarget)
  }
  if (cmpRaw === null || cmpRaw === 0) return ""

  const delta    = primaryRaw - cmpRaw
  const pct      = (delta / Math.abs(cmpRaw)) * 100
  const isUp     = delta > 0
  const isNeutral = delta === 0
  const polarity  = widget?.polarity ?? "higher"
  const isGood    = isNeutral ? null : polarity === "higher" ? isUp : !isUp

  const colorStyle = isNeutral ? "color:#94a3b8"
    : isGood ? "color:#16a34a" : "color:#dc2626"
  const arrow  = isNeutral ? "▶" : isUp ? "▲" : "▼"
  const sign   = isUp ? "+" : ""
  const dFmt   = kpiFormatNum(delta, widget?.numberFormat, widget?.decimals ?? 0)
  const pFmt   = Math.abs(pct).toFixed(1) + "%"
  const lbl    = widget?.comparisonLabel ? ` ${escapeHtml(widget.comparisonLabel)}` : ""

  return `<div class="kpi-delta" style="${colorStyle}">${arrow} ${sign}${escapeHtml(dFmt)} (${sign}${escapeHtml(pFmt)})${lbl}</div>`
}

function computeHtmlCell(row: any[], columns: any[], col: any): string {
  const fmtN = (n: number) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
  const vals = (col.operands || []).map((op: string) => {
    const idx = columns.findIndex((c: any) => c?.name === op)
    return idx >= 0 ? row[idx] : null
  })
  switch (col.formula) {
    case "add":      { const nums = vals.map(Number); if (nums.some(isNaN)) return ""; return fmtN(nums.reduce((a: number, b: number) => a + b, 0)) }
    case "subtract": { const [a, b] = vals.map(Number); return isNaN(a) || isNaN(b) ? "" : fmtN(a - b) }
    case "multiply": { const nums = vals.map(Number); if (nums.some(isNaN)) return ""; return fmtN(nums.reduce((a: number, b: number) => a * b, 1)) }
    case "divide":   { const [a, b] = vals.map(Number); return isNaN(a) || isNaN(b) || b === 0 ? "" : fmtN(a / b) }
    case "percent":  { const [a, b] = vals.map(Number); return isNaN(a) || isNaN(b) || b === 0 ? "" : fmtN(a / b * 100) + "%" }
    case "concat":   return vals.map((v: any) => String(v ?? "") || " ").join(" ")
    default:         return ""
  }
}

function colSumHtml(rows: any[], columns: any[], colName: string): string {
  const fmtN = (n: number) => Number.isInteger(n) ? String(n) : parseFloat(n.toFixed(2)).toString()
  const idx  = columns.findIndex((c: any) => c?.name === colName)
  if (idx < 0) return ""
  const nums = rows.map((r: any) => Number(r?.[idx])).filter(n => isFinite(n))
  if (!nums.length) return ""
  const sum  = nums.reduce((a: number, b: number) => a + b, 0)
  return fmtN(sum)
}

function buildTable(widget: any, columns: any[], rows: any[]): string {
  const selectedColumns: string[] = Array.isArray(widget?.columns) ? widget.columns : []
  const computedCols: any[]       = Array.isArray(widget?.computedColumns) ? widget.computedColumns : []
  const theme       = widget?.theme || "default"
  const showRowNums = !!widget?.showRowNumbers
  const showStats   = !!widget?.showStatsRow

  if (!rows.length || (selectedColumns.length + computedCols.length) === 0) {
    return `<div class="empty-state">Connect a dataset to render table data.</div>`
  }

  const rnHdr  = showRowNums ? `<th style="width:32px;text-align:center">#</th>` : ""
  const header = rnHdr
    + selectedColumns.map((c: string) => `<th>${escapeHtml(c)}</th>`).join("")
    + computedCols.map((c: any) => `<th>${escapeHtml(c.name)}</th>`).join("")

  const body = rows.map((row: any, ri: number) => {
    const rnCell       = showRowNums ? `<td style="width:32px;text-align:center;color:#9ca3af">${ri + 1}</td>` : ""
    const nativeCells  = selectedColumns.map((col: string) => {
      const idx = columns.findIndex((c: any) => c?.name === col)
      return `<td>${escapeHtml(idx > -1 ? row?.[idx] : "")}</td>`
    }).join("")
    const computedCells = computedCols.map((col: any) => `<td>${escapeHtml(computeHtmlCell(row, columns, col))}</td>`).join("")
    return `<tr>${rnCell}${nativeCells}${computedCells}</tr>`
  }).join("")

  const statsRow = showStats ? (() => {
    const rnCell       = showRowNums ? `<td></td>` : ""
    const nativeCells  = selectedColumns.map((col: string) => `<td>${escapeHtml(colSumHtml(rows, columns, col))}</td>`).join("")
    const computedCells = computedCols.map(() => `<td></td>`).join("")
    return `<tr class="tw-stats-row">${rnCell}${nativeCells}${computedCells}</tr>`
  })() : ""

  return `
 <div class="table-shell tw-${theme}">
  <table class="tw-table">
   <thead><tr>${header}</tr></thead>
   <tbody>${body}${statsRow}</tbody>
  </table>
 </div>
 `
}

export function escapeHtml(value: any): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
