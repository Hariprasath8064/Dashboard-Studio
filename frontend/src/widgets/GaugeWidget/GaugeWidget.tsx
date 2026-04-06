import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import type { ChartWidget } from "../../types/widgetTypes"
import { useDashboardStore } from "../../store/dashboardStore"
import { runAggregation } from "../../dataset/QueryEngine"

interface Props { widget: ChartWidget }

export default function GaugeWidget({ widget }: Props) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dataset   = useDashboardStore((s) => s.dashboard.dataset)

  useEffect(() => {

    if (!dataset || !canvasRef.current) return

    const result = runAggregation(
      dataset,
      widget.query.xColumn!,
      widget.query.yColumn!,
      widget.query.aggregation!
    )

    // Gauge = first value as percentage of sum (0-100)
    const total  = result.values.reduce((a, b) => a + b, 0) || 1
    const value  = result.values[0] ?? 0
    const pct    = Math.min(100, Math.max(0, (value / total) * 100))
    const accent = widget.color || "#2b7cff"
    const track  = "#e2e8f0"

    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [pct, 100 - pct],
          backgroundColor: [accent, track],
          borderWidth: 0,
          borderRadius: 4,
          circumference: 180,
          rotation: 270,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        }
      },
      plugins: [{
        id: "gaugeLabel",
        afterDraw(c) {
          const { ctx, chartArea: { top, bottom, left, right } } = c
          const cx = (left + right) / 2
          const cy = bottom - (bottom - top) * 0.08
          ctx.save()
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.font = "bold 20px Inter, sans-serif"
          ctx.fillStyle = accent
          ctx.fillText(`${Math.round(pct)}%`, cx, cy - 10)
          ctx.font = "11px Inter, sans-serif"
          ctx.fillStyle = "#94a3b8"
          ctx.fillText(result.labels[0] || widget.title, cx, cy + 14)
          ctx.restore()
        }
      }]
    })

    return () => chart.destroy()

  }, [dataset, widget])

  return (
    <div className="chart-inner">
      <div className="wg-title">{widget.title}</div>
      <canvas ref={canvasRef} />
      {widget.gaugeText && (
        <div
          className="gauge-subtext"
          style={{
            fontSize:   widget.gaugeTextSize  || 12,
            color:      widget.gaugeTextColor || "#64748b",
            textAlign:  widget.gaugeTextAlign || "center",
            fontWeight: widget.gaugeTextBold   ? 700  : 400,
            fontStyle:  widget.gaugeTextItalic ? "italic" : "normal",
          }}
        >
          {widget.gaugeText}
        </div>
      )}
    </div>
  )
}
