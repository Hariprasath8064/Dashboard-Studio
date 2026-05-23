import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useWidgetDataset } from "../../hooks/useWidgetDataset"
import { runAggregation } from "../../dataset/QueryEngine"
import { applyFilter, resolveConditionalColors, dataLabelPlugin, buildScalesConfig, multiColorLegendLabels } from "../../utils/chartHelpers"
import { chartColors } from "../../constants/chartColors"
import { buildDrillDownClick } from "../../utils/drillDownHelpers"

interface Props {
  widget: ChartWidget
}

export default function BarChartWidget({ widget }: Props) {

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

    const colors = resolveConditionalColors(widget, result.values)

    // Dual Y-axis second dataset
    const datasets: any[] = [{
      label: widget.query.yColumn || widget.title,
      data: result.values,
      backgroundColor: colors,
      yAxisID: "y",
    }]

    if (widget.y2Column && widget.y2Column !== widget.query.yColumn) {
      const r2 = runAggregation(dataset, widget.query.xColumn!, widget.y2Column, (widget.y2Aggregation || widget.query.aggregation)!)
      const y2Base = widget.y2Color || chartColors[1]
      const y2Colors = (Array.isArray(widget.y2BarColors) && widget.y2BarColors.length > 0)
        ? r2.values.map((_: number, i: number) => (widget.y2BarColors as string[])[i] || y2Base)
        : r2.values.map((_: number, i: number) => chartColors[(i + 3) % chartColors.length])
      datasets.push({
        label: widget.y2Column,
        data: r2.values,
        backgroundColor: y2Colors,
        yAxisID: "y2",
        type: "bar",
      })
    }

    const scales = buildScalesConfig(widget, {
      y2: widget.y2Column ? {} : undefined
    })

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: { labels: result.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: widget.showLegend !== false, labels: multiColorLegendLabels },
        },
        scales,
        onClick: buildDrillDownClick(widget, result.labels),
      },
      plugins: widget.showDataLabels ? [dataLabelPlugin] : []
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