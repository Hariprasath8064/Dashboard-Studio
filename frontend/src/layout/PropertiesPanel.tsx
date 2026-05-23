import { useState } from "react"
import { useDashboardStore } from "../store/dashboardStore"

import ChartProperties from "../properties/ChartProperties"
import TextProperties from "../properties/TextProperties"
import TableProperties from "../properties/TableProperties"
import KPIProperties from "../properties/KPIProperties"
import ImageProperties from "../properties/ImageProperties"
import StylePanel from "../properties/panels/StylePanel"
import LayoutPanel from "../properties/panels/LayoutPanel"
import WidgetDataSourcePanel from "../properties/WidgetDataSourcePanel"
import DataSourcePanel from "./DataSourcePanel"
import FieldsPanel from "./FieldsPanel"
import type {
  Widget,
  TextWidget,
  TableWidget,
  KPIWidget,
  ChartWidget,
  ImageWidget,
} from "../types/widgetTypes"

const TYPE_LABELS: Record<string, string> = {
  bar: "Bar Chart",
  line: "Line Chart",
  area: "Area Chart",
  "stacked-bar": "Stacked Bar",
  scatter: "Scatter",
  radar: "Radar",
  donut: "Donut Chart",
  pie: "Pie Chart",
  gauge: "Gauge",
  timeline: "Timeline",
  kpi: "KPI Card",
  table: "Table",
  text: "Text",
  image: "Image",
}

type RightTab = "data" | "fields" | "properties"

export default function PropertiesPanel() {
  const widgets    = useDashboardStore(s => s.dashboard.widgets)
  const selectedId = useDashboardStore(s => s.selectedWidgetId)
  const widget     = widgets.find(w => w.id === selectedId)

  const [tab, setTab] = useState<RightTab>("data")

  const isTextWidget  = (w: Widget): w is TextWidget  => w.type === "text"
  const isTableWidget = (w: Widget): w is TableWidget => w.type === "table"
  const isKPIWidget   = (w: Widget): w is KPIWidget   => w.type === "kpi"
  const isImageWidget = (w: Widget): w is ImageWidget => w.type === "image"
  const isChartWidget = (w: Widget): w is ChartWidget =>
    w.type === "bar" || w.type === "line" || w.type === "donut" ||
    w.type === "area" || w.type === "stacked-bar" || w.type === "scatter" ||
    w.type === "radar" ||
    w.type === "pie" || w.type === "gauge" || w.type === "timeline"

  function renderWidgetProperties(w: Widget) {
    if (isTextWidget(w))  return <TextProperties widget={w} />
    if (isTableWidget(w)) return <TableProperties widget={w} />
    if (isKPIWidget(w))   return <KPIProperties widget={w} />
    if (isImageWidget(w)) return <ImageProperties widget={w} />
    if (isChartWidget(w)) return <ChartProperties widget={w} />
    return null
  }

  return (
    <div id="right-panel">
      <div className="panel-view-tabs">
        <button type="button" className={tab === "data" ? "active" : ""} onClick={() => setTab("data")}>
          Data
        </button>
        <button type="button" className={tab === "fields" ? "active" : ""} onClick={() => setTab("fields")}>
          Fields
        </button>
        <button type="button" className={tab === "properties" ? "active" : ""} onClick={() => setTab("properties")}>
          Properties
        </button>
      </div>

      <div className="panel-view-body">
        {tab === "data" && <DataSourcePanel />}
        {tab === "fields" && <FieldsPanel />}
        {tab === "properties" && (
          widget ? (
            <div className="panel-tab-inner">
              <div className="pp-widget-type">
                <span className="pp-badge">{TYPE_LABELS[widget.type] || widget.type}</span>
              </div>
              <WidgetDataSourcePanel widget={widget} />
              {renderWidgetProperties(widget)}
              <StylePanel widget={widget} />
              <LayoutPanel widget={widget} />
            </div>
          ) : (
            <div className="panel-empty">
              <svg className="panel-empty-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
                <rect x="6" y="8" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M14 20h12M20 14v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              </svg>
              <p className="panel-empty-title">No widget selected</p>
              <p className="panel-empty-desc">
                Click a widget on the canvas to edit its settings.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
