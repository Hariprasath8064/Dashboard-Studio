import { buildGaugeScript }      from "./scripts/gaugeScript"
import { buildTimelineScript }    from "./scripts/timelineScript"
import { buildScatterScript }     from "./scripts/scatterScript"
import { buildRadarScript }       from "./scripts/radarScript"
import { buildStackedBarScript }  from "./scripts/stackedBarScript"
import { buildAreaScript }        from "./scripts/areaScript"
import { buildBarScript, buildLineScript, buildDonutPieScript } from "./scripts/barLineDonutScript"

export function buildChartScript(widget: any, dataset: any): string {

  if (!dataset || !widget.query) return ""

  switch (widget.type) {
    case "gauge":       return buildGaugeScript(widget, dataset)
    case "timeline":    return buildTimelineScript(widget, dataset)
    case "scatter":     return buildScatterScript(widget, dataset)
    case "radar":       return buildRadarScript(widget, dataset)
    case "stacked-bar": return buildStackedBarScript(widget, dataset)
    case "area":        return buildAreaScript(widget, dataset)
    case "bar":         return buildBarScript(widget, dataset)
    case "line":        return buildLineScript(widget, dataset)
    case "donut":
    case "pie":         return buildDonutPieScript(widget, dataset)
    default:            return ""
  }
}

