export interface DonutConfig {

  title: string

  categoryColumn: string

  valueColumn: string

  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "MIN"
    | "MAX"

}