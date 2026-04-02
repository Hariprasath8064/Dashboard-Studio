export interface BarChartConfig {

  title: string

  xColumn: string

  yColumn: string

  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "MIN"
    | "MAX"

  color?: string

}