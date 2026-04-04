import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"
import { resolveColors } from "../../utils/chartHelpers"

interface Props {
  widget: ChartWidget
}

export default function DonutWidget({ widget }: Props) {

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

      type: "doughnut",

      data: {
        labels: result.labels,
        datasets: [
          {
            data: result.values,
            backgroundColor: resolveColors(widget, result.values.length)
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
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