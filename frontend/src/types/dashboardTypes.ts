import type { Dataset } from "./datasetTypes"
import type { Widget } from "./widgetTypes"
import type { BigfixQueryConfig } from "./bigfixTypes"

export interface CanvasConfig {
  width: number
  height: number
}

export interface CanvasBackground {
  color?: string
  image?: string
}

export interface Dashboard {

  id: string

  name: string

  canvas: CanvasConfig

  dataset: Dataset | null

  widgets: Widget[]

  background?: CanvasBackground

  /** When true, data comes from BigFix; when false, from Excel/CSV */
  bigfixMode?: boolean

  /** The global BigFix query configuration — persisted so the query can be re-run */
  bigfixQueryConfig?: BigfixQueryConfig

}

export interface DashboardState {

  dashboard: Dashboard

  selectedWidgetId: string | null

  zoom: number

}