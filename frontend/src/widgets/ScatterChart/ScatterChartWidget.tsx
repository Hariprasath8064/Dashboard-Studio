import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"

interface Props { widget: ChartWidget }

export default function ScatterChartWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset   = useDashboardStore((s) => s.dashboard.dataset)

  useEffect(() => {
    if (!dataset || !canvasRef.current) return
    const xCol = widget.query.xColumn
    const yCol = widget.query.yColumn
    if (!xCol || !yCol) return

    const xIdx = dataset.columns.findIndex((c) => c.name === xCol)
    const yIdx = dataset.columns.findIndex((c) => c.name === yCol)
    if (xIdx < 0 || yIdx < 0) return

    // Each row → a {x, y} point (no aggregation)
    const points = (dataset.rows as any[][]).reduce<{x: number; y: number}[]>((acc, row) => {
      const x = Number(row[xIdx])
      const y = Number(row[yIdx])
      if (Number.isFinite(x) && Number.isFinite(y)) acc.push({ x, y })
      return acc
    }, [])

    const color = widget.color || "#2b7cff"
    const fontSize = widget.axisFontSize || 11

    const chart = new Chart(canvasRef.current, {
      type: "scatter",
      data: {
        datasets: [{
          label: `${xCol} vs ${yCol}`,
          data: points,
          backgroundColor: color + "99",
          borderColor: color,
          borderWidth: 1,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: widget.showLegend !== false } },
        scales: {
          x: {
            type: "linear",
            title: { display: true, text: widget.xAxisLabel || xCol, font: { size: fontSize } },
            ticks: { font: { size: fontSize } },
            grid: { color: "rgba(0,0,0,.05)" }
          },
          y: {
            title: { display: true, text: widget.yAxisLabel || yCol, font: { size: fontSize } },
            ticks: { font: { size: fontSize } }
          }
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
