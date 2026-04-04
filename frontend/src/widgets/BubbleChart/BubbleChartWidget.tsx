import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"
import { applyFilter } from "../../utils/chartHelpers"
import { chartColors } from "../../constants/chartColors"

interface Props { widget: ChartWidget }

export default function BubbleChartWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset   = useDashboardStore((s) => s.dashboard.dataset)

  useEffect(() => {
    if (!dataset || !canvasRef.current) return

    let result = runAggregation(dataset, widget.query.xColumn!, widget.query.yColumn!, widget.query.aggregation!)
    result = applyFilter(result, widget)

    if (!result.values.length) return

    // Normalize bubble radius 5–30px based on value magnitude
    const max    = Math.max(...result.values.map(Math.abs)) || 1
    const points = result.labels.map((_, i) => ({
      x: i + 1,
      y: result.values[i],
      r: Math.max(5, Math.round((Math.abs(result.values[i]) / max) * 25))
    }))

    const colors = result.labels.map((_, i) => {
      const hasPerBar = Array.isArray(widget.barColors) && widget.barColors.length > 0
      return hasPerBar ? (widget.barColors![i] || chartColors[i % chartColors.length]) : chartColors[i % chartColors.length]
    })

    const fontSize = widget.axisFontSize || 11

    const chart = new Chart(canvasRef.current, {
      type: "bubble",
      data: {
        datasets: result.labels.map((label, i) => ({
          label,
          data: [points[i]],
          backgroundColor: colors[i] + "99",
          borderColor: colors[i],
          borderWidth: 1,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: widget.showLegend !== false } },
        scales: {
          x: {
            type: "linear",
            title: { display: !!widget.xAxisLabel, text: widget.xAxisLabel || "", font: { size: fontSize } },
            ticks: {
              stepSize: 1,
              callback: (val: any) => result.labels[val - 1] || "",
              font: { size: fontSize }
            }
          },
          y: {
            title: { display: !!widget.yAxisLabel, text: widget.yAxisLabel || widget.query.yColumn || "", font: { size: fontSize } },
            ticks: { font: { size: fontSize } },
            beginAtZero: true
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
