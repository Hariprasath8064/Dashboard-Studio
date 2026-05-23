import type { Dataset } from "./datasetTypes"
import type { Widget } from "./widgetTypes"
import type { BigfixQueryConfig, BigfixDataSource } from "./bigfixTypes"
import type { ThemeConfig } from "../theme/themePresets"

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

  /** Legacy / active builder config — mirrors the active data source query */
  bigfixQueryConfig?: BigfixQueryConfig

  /** All BigFix fetches in this dashboard (each can power different widgets) */
  bigfixDataSources?: BigfixDataSource[]

  /** Which fetch is selected in the Fields panel for new widgets */
  activeDataSourceId?: string

  theme?: ThemeConfig

  bigfixFetchedAt?: string

}

export interface DashboardState {

  dashboard: Dashboard

  selectedWidgetId: string | null

  zoom: number

}