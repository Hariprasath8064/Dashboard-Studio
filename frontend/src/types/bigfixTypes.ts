export interface BigfixProperty {
  name: string
  relevancePath: string
  type: string
  dataType: string
}

export interface BigfixSchema {
  objectsList: string[]
  properties: Record<string, BigfixProperty[]>
  plurals?: Record<string, string>
}

/** Global BigFix query configuration — stored in the dashboard, used to re-run the query */
export interface BigfixQueryConfig {
  objectType: string
  dimension: string
  metric: string
  additionalProps: string[]
  sites: string[]
}

export const EMPTY_BIGFIX_QUERY: BigfixQueryConfig = {
  objectType: '',
  dimension: '',
  metric: '',
  additionalProps: [],
  sites: [],
}
