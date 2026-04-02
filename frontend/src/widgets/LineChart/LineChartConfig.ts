export interface LineChartConfig {

  title: string

  xColumn: string

  yColumn: string

  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "MIN"
    | "MAX"

  smooth?: boolean

  color?: string

}