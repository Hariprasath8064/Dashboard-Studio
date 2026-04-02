import type { Dataset } from "./datasetTypes"
import type { Widget } from "./widgetTypes"

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

}

export interface DashboardState {

  dashboard: Dashboard

  selectedWidgetId: string | null

  zoom: number

}