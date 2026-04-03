import type { DatasetQuery } from "./datasetTypes"

export type WidgetType =
  | "bar"
  | "line"
  | "donut"
  | "pie"
  | "gauge"
  | "timeline"
  | "kpi"
  | "table"
  | "text"

export interface WidgetPosition {

  x: number
  y: number

}

export interface WidgetSize {

  width: number
  height: number

}

export interface WidgetBase {

  id: string

  type: WidgetType

  position: WidgetPosition

  size: WidgetSize

  zIndex: number

}

export interface ChartWidget extends WidgetBase {

  query: DatasetQuery

  title: string

  color?: string

  barColors?: string[]

  showLegend?: boolean

}

export interface KPIWidget extends WidgetBase {

  label: string

  valueColumn: string

  aggregation: string

  color?: string

  prefix?: string

  suffix?: string

  fontSize?: number

  decimals?: number

}

export interface ComputedColumn {

  id: string

  name: string

  formula: "add" | "subtract" | "multiply" | "divide" | "percent" | "concat"

  operands: string[]

}

export interface TableWidget extends WidgetBase {

  columns: string[]

  theme?: string

  computedColumns?: ComputedColumn[]

  showRowNumbers?: boolean

  showStatsRow?: boolean

}

export interface TextWidget extends WidgetBase {

  heading: string

  body: string

  // ── Text styling ──
  headingSize?:   number
  headingColor?:  string
  headingBold?:   boolean
  headingItalic?: boolean
  headingAlign?:  "left" | "center" | "right"
  headingFont?:   string

  bodySize?:      number
  bodyColor?:     string
  bodyBold?:      boolean
  bodyItalic?:    boolean
  bodyUnderline?: boolean
  bodyAlign?:     "left" | "center" | "right"
  bodyFont?:      string

}

export type Widget =
  | ChartWidget
  | KPIWidget
  | TableWidget
  | TextWidget