import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"
import { applyFilter, resolveConditionalColors } from "../../utils/chartHelpers"
import { chartColors } from "../../constants/chartColors"

interface Props { widget: ChartWidget }

export default function StackedBarWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset   = useDashboardStore((s) => s.dashboard.dataset)

  useEffect(() => {
    if (!dataset || !canvasRef.current) return

    let result = runAggregation(dataset, widget.query.xColumn!, widget.query.yColumn!, widget.query.aggregation!)
    result = applyFilter(result, widget)

    const colors = resolveConditionalColors(widget, result.values)

    const fontSize = widget.axisFontSize || 11

    // Dual Y if configured
    const datasets: any[] = [{
      label: widget.query.yColumn || widget.title,
      data: result.values,
      backgroundColor: colors,
      borderWidth: 0,
      stack: "s1",
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
        borderWidth: 0,
        stack: "s1",
      })
    }

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: { labels: result.labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: widget.showLegend !== false },
        },
        scales: {
          x: {
            stacked: true,
            title: { display: !!widget.xAxisLabel, text: widget.xAxisLabel || "", font: { size: fontSize } },
            ticks: { maxRotation: widget.xTickRotation ?? 0, minRotation: widget.xTickRotation ?? 0, font: { size: fontSize } },
            grid: { color: "rgba(0,0,0,.05)" }
          },
          y: {
            stacked: true,
            title: { display: !!widget.yAxisLabel, text: widget.yAxisLabel || "", font: { size: fontSize } },
            ticks: { font: { size: fontSize } },
            beginAtZero: true
          }
        },
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

const dataLabelPlugin = {
  id: "dl",
  afterDatasetDraw(chart: any) {
    const { ctx } = chart
    chart.data.datasets.forEach((_: any, i: number) => {
      const meta = chart.getDatasetMeta(i)
      meta.data.forEach((bar: any, idx: number) => {
        const v = chart.data.datasets[i].data[idx]
        if (v == null || v === 0) return
        ctx.save()
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        ctx.fillStyle = "#374151"
        ctx.font = "bold 10px Inter,sans-serif"
        ctx.fillText(typeof v === "number" ? v.toLocaleString(undefined, { maximumFractionDigits: 1 }) : v, bar.x, bar.y - 3)
        ctx.restore()
      })
    })
  }
}
