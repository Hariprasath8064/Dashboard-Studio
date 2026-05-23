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

/** One BigFix fetch in the session — widgets bind to a source via dataSourceId */
export interface BigfixDataSource {
  id: string
  name: string
  queryConfig: BigfixQueryConfig
  generatedQuery: string
  fetchedAt: string
  datasetId: string | null
}

export const EMPTY_BIGFIX_QUERY: BigfixQueryConfig = {
  objectType: '',
  dimension: '',
  metric: '',
  additionalProps: [],
  sites: [],
}
