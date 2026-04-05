import { DEFAULT_COLOR, buildScalesOpts } from "./shared"

export function buildScatterScript(widget: any, dataset: any): string {
  const xIdx = dataset.columns.findIndex((c: any) => c.name === widget.query.xColumn)
  const yIdx = dataset.columns.findIndex((c: any) => c.name === widget.query.yColumn)
  if (xIdx < 0 || yIdx < 0) return ""

  const points = (dataset.rows as any[][]).reduce<{ x: number; y: number }[]>((acc, row) => {
    const x = Number(row[xIdx]), y = Number(row[yIdx])
    if (Number.isFinite(x) && Number.isFinite(y)) acc.push({ x, y })
    return acc
  }, [])

  const color = widget.color || DEFAULT_COLOR
  const scales = buildScalesOpts(widget, {
    x: {
      type: "linear",
      title: { display: true, text: widget.xAxisLabel || widget.query.xColumn || "" }
    },
    y: {
      beginAtZero: false,
      title: { display: true, text: widget.yAxisLabel || widget.query.yColumn || "" }
    }
  })
  const opts  = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: widget.showLegend !== false } },
    scales
  }
  const ds = `{ label:${JSON.stringify(widget.title || "")}, data:${JSON.stringify(points)}, backgroundColor:${JSON.stringify(color + "99")}, borderColor:${JSON.stringify(color)}, borderWidth:1, pointRadius:4 }`

  return `
 {
  const ctx=document.getElementById("chart-${widget.id}");
  if(ctx){ new Chart(ctx,{ type:"scatter", data:{ datasets:[${ds}] }, options:${JSON.stringify(opts)} }); }
 }`
}
