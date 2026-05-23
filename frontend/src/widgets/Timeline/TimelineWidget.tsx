import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useWidgetDataset } from "../../hooks/useWidgetDataset"
import { chartColors } from "../../constants/chartColors"
import { multiColorLegendLabels } from "../../utils/chartHelpers"

interface Props { widget: ChartWidget }

export default function TimelineWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset   = useWidgetDataset(widget)

  useEffect(() => {

    if (!dataset || !canvasRef.current) return

    const xCol = widget.query.xColumn
    const yCol = widget.query.yColumn
    if (!xCol || !yCol) return

    const xIdx = dataset.columns.findIndex((c) => c.name === xCol)
    const yIdx = dataset.columns.findIndex((c) => c.name === yCol)
    if (xIdx < 0 || yIdx < 0) return

    // Group by x label, accumulate y values per category
    const grouped = new Map<string, number[]>()
    for (const row of dataset.rows as any[][]) {
      const key = String(row[xIdx] ?? "")
      const val = Number(row[yIdx])
      if (!grouped.has(key)) grouped.set(key, [])
      if (Number.isFinite(val)) grouped.get(key)!.push(val)
    }

    const labels = Array.from(grouped.keys())
    const values = labels.map((k) => {
      const arr = grouped.get(k)!
      const agg = (widget.query.aggregation || "SUM").toUpperCase()
      if (agg === "AVG")   return arr.reduce((a, b) => a + b, 0) / arr.length
      if (agg === "COUNT") return arr.length
      if (agg === "MIN")   return Math.min(...arr)
      if (agg === "MAX")   return Math.max(...arr)
      return arr.reduce((a, b) => a + b, 0)
    })

    const colors = Array.isArray(widget.barColors) && widget.barColors.length
      ? Array.from({ length: values.length }, (_, i) => widget.barColors![i] || chartColors[i % chartColors.length])
      : Array.from({ length: values.length }, (_, i) => chartColors[i % chartColors.length])

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: yCol,
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 3,
        }]
      },
      options: {
        indexAxis: "y",   // horizontal bars = timeline feel
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: widget.showLegend !== false, labels: multiColorLegendLabels },
        },
        scales: {
          x: { beginAtZero: true, grid: { color: "rgba(0,0,0,.05)" } },
          y: { ticks: { font: { size: 11 } } }
        }
      }
    })

    return () => chart.destroy()

  }, [dataset, widget])

  return (
    <div className="chart-inner">
      <div className="wg-title">{widget.title}</div>
      <canvas ref={canvasRef} />
    </div>
  )
}
