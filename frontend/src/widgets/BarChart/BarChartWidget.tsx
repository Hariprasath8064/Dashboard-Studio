import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"
import { chartColors } from "../../constants/chartColors"

function resolveColors(widget: ChartWidget, count: number): string[] {
  if (Array.isArray(widget.barColors) && widget.barColors.length > 0) {
    return Array.from({ length: count }, (_, i) => widget.barColors![i] || widget.barColors![widget.barColors!.length - 1] || chartColors[i % chartColors.length])
  }
  if (widget.color) return Array(count).fill(widget.color)
  return Array.from({ length: count }, (_, i) => chartColors[i % chartColors.length])
}

interface Props {
  widget: ChartWidget
}

export default function BarChartWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset = useDashboardStore((s) => s.dashboard.dataset)

  useEffect(() => {

    if (!dataset || !canvasRef.current) return

    const result = runAggregation(
      dataset,
      widget.query.xColumn!,
      widget.query.yColumn!,
      widget.query.aggregation!
    )

    const chart = new Chart(canvasRef.current, {

      type: "bar",

      data: {
        labels: result.labels,
        datasets: [
          {
            label: widget.title,
            data: result.values,
            backgroundColor: resolveColors(widget, result.values.length)
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: widget.showLegend !== false } }
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