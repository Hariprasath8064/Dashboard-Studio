import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"

interface Props {
  widget: ChartWidget
}

export default function LineChartWidget({ widget }: Props) {

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

      type: "line",

      data: {
        labels: result.labels,
        datasets: [
          {
            label: widget.title,
            data: result.values,
            borderColor: widget.color || "#005EB8",
            backgroundColor:widget.color || "#005EB8",
            tension: 0.3
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false
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