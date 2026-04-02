import type { Widget } from "../types/widgetTypes"

export function buildWidgetHTML(widget: Widget) {

  const style = `
left:${widget.position.x}px;
top:${widget.position.y}px;
width:${widget.size.width}px;
height:${widget.size.height}px;
z-index:${widget.zIndex};
`

  if (widget.type === "text") {

    return `
<div class="widget" style="${style}">
<div style="padding:10px">
<h3>${(widget as any).heading}</h3>
<p>${(widget as any).body}</p>
</div>
</div>
`

  }

  if (widget.type === "kpi") {

    return `
<div class="widget" style="${style}">
<div style="padding:20px;text-align:center">
<h1 id="kpi-${widget.id}">0</h1>
<div>${(widget as any).label}</div>
</div>
</div>
`

  }

  if (widget.type === "table") {

    return `
<div class="widget" style="${style}">
<table id="table-${widget.id}" style="width:100%"></table>
</div>
`

  }

  return `
<div class="widget" style="${style}">
<div class="chart-title">${(widget as any).title}</div>
<canvas id="chart-${widget.id}"></canvas>
</div>
`

}