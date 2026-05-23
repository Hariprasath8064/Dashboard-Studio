import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useWidgetDataset } from "../../hooks/useWidgetDataset"
import { runAggregation } from "../../dataset/QueryEngine"
import { applyFilter } from "../../utils/chartHelpers"

interface Props { widget: ChartWidget }

export default function RadarChartWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset   = useWidgetDataset(widget)

  useEffect(() => {
    if (!dataset || !canvasRef.current) return

    let result = runAggregation(dataset, widget.query.xColumn!, widget.query.yColumn!, widget.query.aggregation!)
    result = applyFilter(result, widget)

    const color = widget.color || "#2b7cff"

    const chart = new Chart(canvasRef.current, {
      type: "radar",
      data: {
        labels: result.labels,
        datasets: [{
          label: widget.query.yColumn || widget.title,
          data: result.values,
          borderColor: color,
          backgroundColor: color + "33",
          pointBackgroundColor: color,
          pointRadius: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: widget.showLegend !== false } },
        scales: {
          r: {
            beginAtZero: true,
            ticks: { font: { size: widget.axisFontSize || 10 } },
            pointLabels: { font: { size: widget.axisFontSize || 11 } }
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
