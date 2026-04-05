// Shared utilities used by all chart script builders

import { chartColors } from "../../constants/chartColors"
import type { ColorRule } from "../../types/widgetTypes"

export const DEFAULT_COLOR = "#2b7cff"
export const TRACK_COLOR   = "#e2e8f0"

export function resolveColors(widget: any, count: number): string[] {
  if (Array.isArray(widget.barColors) && widget.barColors.length > 0) {
    const base = widget.barColors
    return Array.from({ length: count }, (_, i) => base[i] || base[base.length - 1] || DEFAULT_COLOR)
  }
  if (widget.color) return Array(count).fill(widget.color)
  return Array.from({ length: count }, (_, i) => chartColors[i % chartColors.length])
}

export function resolveConditionalColors(widget: any, values: number[]): string[] {
  const rules: ColorRule[] = widget.colorRules || []
  return values.map((v, i) => {
    if (Array.isArray(widget.barColors) && widget.barColors[i]) return widget.barColors[i]
    for (const rule of rules) {
      if (matchRule(v, rule)) return rule.color
    }
    if (widget.color) return widget.color
    return chartColors[i % chartColors.length]
  })
}

export function matchRule(value: number, rule: ColorRule): boolean {
  switch (rule.op) {
    case "lt":  return value <  rule.value
    case "lte": return value <= rule.value
    case "gt":  return value >  rule.value
    case "gte": return value >= rule.value
    case "eq":  return value === rule.value
    default:    return false
  }
}

export function applyFilter(result: { labels: string[]; values: number[] }, widget: any) {
  const topN = widget.filterTopN
  if (!topN || topN <= 0 || result.labels.length <= topN) return result
  const pairs = result.labels.map((l, i) => ({ l, v: result.values[i] }))
  pairs.sort((a, b) => b.v - a.v)
  const top = pairs.slice(0, topN)
  return { labels: top.map(p => p.l), values: top.map(p => p.v) }
}

export function buildScalesOpts(widget: any, extra: Record<string, any> = {}) {
  const fs  = widget.axisFontSize || 11
  const rot = widget.xTickRotation ?? 0
  return {
    x: {
      title: { display: !!widget.xAxisLabel, text: widget.xAxisLabel || "", font: { size: fs } },
      ticks: { maxRotation: rot, minRotation: rot, font: { size: fs } },
      grid:  { color: "rgba(0,0,0,.05)" },
      ...extra.x
    },
    y: {
      title: { display: !!widget.yAxisLabel, text: widget.yAxisLabel || "", font: { size: fs } },
      ticks: { font: { size: fs } },
      beginAtZero: true,
      ...extra.y
    },
    ...(extra.y2 ? {
      y2: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { font: { size: fs } },
        title: { display: !!widget.y2Column, text: widget.y2Column || "", font: { size: fs } },
        ...extra.y2
      }
    } : {})
  }
}

export const DATA_LABEL_PLUGIN_SRC = `{id:"dl",afterDatasetDraw(c){const{ctx}=c;c.data.datasets.forEach((_,i)=>{const m=c.getDatasetMeta(i);m.data.forEach((b,j)=>{const v=c.data.datasets[i].data[j];if(v==null||v===0)return;ctx.save();ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillStyle="#374151";ctx.font="bold 10px Inter,sans-serif";ctx.fillText(typeof v==="number"?v.toLocaleString(undefined,{maximumFractionDigits:1}):v,b.x,b.y-3);ctx.restore();})})}}`
