export type ColumnType =
  | "number"
  | "string"
  | "date"

export interface DatasetColumn {

  name: string

  type: ColumnType

}

export interface Dataset {

  columns: DatasetColumn[]

  rows: any[][]

}

export type AggregationType =
  | "SUM"
  | "AVG"
  | "COUNT"
  | "MIN"
  | "MAX"

export interface DatasetQuery {

  xColumn?: string

  yColumn?: string

  aggregation?: AggregationType

  filter?: {
    column: string
    value: any
  }

}