import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useWidgetDataset } from "../../hooks/useWidgetDataset"
import { runAggregation } from "../../dataset/QueryEngine"
import { applyFilter, buildScalesConfig, linePointDatasetOpts, LINE_CHART_INTERACTION } from "../../utils/chartHelpers"
import { chartColors } from "../../constants/chartColors"
import { buildDrillDownClick } from "../../utils/drillDownHelpers"

interface Props {
  widget: ChartWidget
}

export default function LineChartWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset = useWidgetDataset(widget)

  useEffect(() => {

    if (!dataset || !canvasRef.current) return

    let result = runAggregation(
      dataset,
      widget.query.xColumn!,
      widget.query.yColumn!,
      widget.query.aggregation!
    )
    result = applyFilter(result, widget)

    const color = widget.color || "#005EB8"

    const datasets: any[] = [{
      label: widget.query.yColumn || widget.title,
      data: result.values,
      borderColor: color,
      backgroundColor: color,
      tension: 0.3,
      yAxisID: "y",
      ...linePointDatasetOpts(color),
    }]

    if (widget.y2Column && widget.y2Column !== widget.query.yColumn) {
      const r2 = runAggregation(dataset, widget.query.xColumn!, widget.y2Column, (widget.y2Aggregation || widget.query.aggregation)!)
      const c2 = widget.y2Color || chartColors[1]
      datasets.push({
        label: widget.y2Column,
        data: r2.values,
        borderColor: c2,
        backgroundColor: c2,
        tension: 0.3,
        yAxisID: "y2",
        ...linePointDatasetOpts(c2),
      })
    }

    const scales = buildScalesConfig(widget, {
      y2: widget.y2Column ? {} : undefined
    })

    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: { labels: result.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...LINE_CHART_INTERACTION,
        plugins: {
          legend: { display: widget.showLegend !== false },
          tooltip: { enabled: true },
        },
        scales,
        onClick: buildDrillDownClick(widget, result.labels),
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