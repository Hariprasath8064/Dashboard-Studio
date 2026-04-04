import type { DatasetQuery, AggregationType } from "./datasetTypes"

export type WidgetType =
  | "bar"
  | "line"
  | "area"
  | "stacked-bar"
  | "scatter"
  | "radar"
  | "donut"
  | "pie"
  | "gauge"
  | "timeline"
  | "kpi"
  | "table"
  | "text"

export interface ColorRule {
  op: "lt" | "gt" | "lte" | "gte" | "eq"
  value: number
  color: string
}

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

  // ── Dual Y-axis ──
  y2Column?: string
  y2Aggregation?: AggregationType
  y2Color?: string
  y2BarColors?: string[]

  // ── Axis customization ──
  xAxisLabel?: string
  yAxisLabel?: string
  axisFontSize?: number
  xTickRotation?: number

  // ── Data labels ──
  showDataLabels?: boolean

  // ── Conditional coloring ──
  colorRules?: ColorRule[]

  // ── Filter ──
  filterTopN?: number

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