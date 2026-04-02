export interface KPIConfig {

  label: string

  column: string

  aggregation:
    | "SUM"
    | "AVG"
    | "COUNT"
    | "MIN"
    | "MAX"

  prefix?: string

  suffix?: string

}