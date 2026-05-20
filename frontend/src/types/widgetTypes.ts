import type { DatasetQuery, AggregationType } from "./datasetTypes"

export interface DrillDownConfig {
  enabled: boolean
  displayColumns?: string[]   // empty / undefined = all columns
}

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
  | "image"

export type FitMode = "cover" | "contain" | "fill" | "none"

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

  drillDown?: DrillDownConfig

  // ── Gauge sub-text ──
  gaugeText?: string
  gaugeTextSize?: number
  gaugeTextColor?: string
  gaugeTextAlign?: "left" | "center" | "right"
  gaugeTextBold?: boolean
  gaugeTextItalic?: boolean

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

  // "auto" shrinks large numbers to K/M/B automatically
  numberFormat?: "auto" | "full" | "k" | "m" | "b"

  // Comparison / target
  comparisonType?:   "none" | "column" | "target"
  comparisonColumn?: string
  comparisonTarget?: number
  comparisonLabel?:  string
  // "higher" = bigger value is good (green ▲), "lower" = smaller is good (green ▼)
  polarity?: "higher" | "lower"

  drillDown?: DrillDownConfig

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

export interface ImageWidget extends WidgetBase {

  sourceType: "url" | "upload"

  src: string

  fit: FitMode

  // 0–100
  opacity: number

  alt?: string

}

export type Widget =
  | ChartWidget
  | KPIWidget
  | TableWidget
  | TextWidget
  | ImageWidget