import type { Dataset } from "../types/datasetTypes"
import type { BigfixDataSource, BigfixQueryConfig } from "../types/bigfixTypes"
import type { Widget } from "../types/widgetTypes"
import { datasetApi } from "../services/datasetApi"
import { runBigfixFetch } from "../utils/bigfixFetch"
import { bigfixSourceLabel } from "../utils/bigfixQueryUtils"
import type { BigfixSchema } from "../types/bigfixTypes"

export type BigfixSourceRuntime = BigfixDataSource & { dataset: Dataset | null }

export interface BigfixSourceSlice {
  bigfixDataSources: BigfixSourceRuntime[]
  activeDataSourceId: string | null

  setBigfixSourcesFromLoad: (sources: BigfixDataSource[], datasets: Record<string, Dataset>) => void
  addBigfixDataSource: (params: {
    queryConfig: BigfixQueryConfig
    dataset: Dataset
    generatedQuery: string
    datasetId?: string | null
    name?: string
  }) => string
  updateBigfixSourceDataset: (id: string, dataset: Dataset, generatedQuery: string, datasetId?: string | null) => void
  setActiveDataSourceId: (id: string | null) => void
  setWidgetDataSource: (widgetId: string, sourceId: string) => void
  getDatasetForWidget: (widget: Pick<Widget, "dataSourceId">) => Dataset | null
  getActiveSource: () => BigfixSourceRuntime | null
  refreshBigfixDataSource: (id: string, schema: BigfixSchema) => Promise<void>
  refreshAllBigfixDataSources: (schema: BigfixSchema) => Promise<void>
  persistBigfixSources: () => Promise<BigfixDataSource[]>
}

export function createBigfixSourceSlice(set: any, get: any): BigfixSourceSlice {
  return {
    bigfixDataSources: [],
    activeDataSourceId: null,

    setBigfixSourcesFromLoad(sources, datasets) {
      const runtime: BigfixSourceRuntime[] = sources.map(s => ({
        ...s,
        dataset: datasets[s.id] ?? null,
      }))
      const activeId = sources[0]?.id ?? null
      const active = runtime.find(r => r.id === activeId) ?? runtime[0]
      set((state: any) => ({
        bigfixDataSources: runtime,
        activeDataSourceId: activeId,
        dashboard: {
          ...state.dashboard,
          bigfixDataSources: sources,
          activeDataSourceId: activeId,
          bigfixQueryConfig: active?.queryConfig ?? state.dashboard.bigfixQueryConfig,
          dataset: active?.dataset ?? state.dashboard.dataset,
          bigfixFetchedAt: active?.fetchedAt,
        },
      }))
    },

    addBigfixDataSource({ queryConfig, dataset, generatedQuery, datasetId = null, name }) {
      const id = crypto.randomUUID()
      const fetchedAt = new Date().toISOString()
      const source: BigfixSourceRuntime = {
        id,
        name: name ?? bigfixSourceLabel(queryConfig.objectType),
        queryConfig,
        generatedQuery,
        fetchedAt,
        datasetId,
        dataset,
      }
      const persisted: BigfixDataSource = {
        id: source.id,
        name: source.name,
        queryConfig: source.queryConfig,
        generatedQuery: source.generatedQuery,
        fetchedAt: source.fetchedAt,
        datasetId: source.datasetId,
      }
      set((state: any) => ({
        bigfixDataSources: [...state.bigfixDataSources, source],
        activeDataSourceId: id,
        dashboard: {
          ...state.dashboard,
          bigfixDataSources: [...(state.dashboard.bigfixDataSources ?? []), persisted],
          activeDataSourceId: id,
          bigfixQueryConfig: queryConfig,
          dataset,
          bigfixFetchedAt: fetchedAt,
        },
      }))
      return id
    },

    updateBigfixSourceDataset(id, dataset, generatedQuery, datasetId) {
      set((state: any) => {
        const sources = state.bigfixDataSources.map((s: BigfixSourceRuntime) =>
          s.id === id
            ? { ...s, dataset, generatedQuery, fetchedAt: new Date().toISOString(), datasetId: datasetId ?? s.datasetId }
            : s
        )
        const active = state.activeDataSourceId === id
        const dashSources = (state.dashboard.bigfixDataSources ?? []).map((s: BigfixDataSource) => {
          const r = sources.find((x: BigfixSourceRuntime) => x.id === s.id)
          if (!r) return s
          return { ...s, generatedQuery: r.generatedQuery, fetchedAt: r.fetchedAt, datasetId: r.datasetId }
        })
        return {
          bigfixDataSources: sources,
          dashboard: {
            ...state.dashboard,
            bigfixDataSources: dashSources,
            ...(active ? { dataset, bigfixFetchedAt: new Date().toISOString() } : {}),
          },
        }
      })
    },

    setActiveDataSourceId(id) {
      set((state: any) => {
        const src = state.bigfixDataSources.find((s: BigfixSourceRuntime) => s.id === id)
        return {
          activeDataSourceId: id,
          dashboard: {
            ...state.dashboard,
            activeDataSourceId: id,
            bigfixQueryConfig: src?.queryConfig ?? state.dashboard.bigfixQueryConfig,
            dataset: src?.dataset ?? state.dashboard.dataset,
          },
        }
      })
    },

    setWidgetDataSource(widgetId, sourceId) {
      set((state: any) => ({
        dashboard: {
          ...state.dashboard,
          widgets: state.dashboard.widgets.map((w: Widget) =>
            w.id === widgetId ? { ...w, dataSourceId: sourceId } : w
          ),
        },
      }))
    },

    getDatasetForWidget(widget) {
      const state = get()
      if (!state.dashboard.bigfixMode) return state.dashboard.dataset
      const id = widget.dataSourceId ?? state.activeDataSourceId
      if (!id) return state.dashboard.dataset
      const src = state.bigfixDataSources.find((s: BigfixSourceRuntime) => s.id === id)
      return src?.dataset ?? state.dashboard.dataset
    },

    getActiveSource() {
      const state = get()
      if (!state.activeDataSourceId) return state.bigfixDataSources[0] ?? null
      return state.bigfixDataSources.find((s: BigfixSourceRuntime) => s.id === state.activeDataSourceId) ?? null
    },

    async refreshBigfixDataSource(id, schema) {
      const state = get()
      const src = state.bigfixDataSources.find((s: BigfixSourceRuntime) => s.id === id)
      if (!src?.queryConfig?.objectType || !src.queryConfig.dimension) return

      const { dataset, generatedQuery } = await runBigfixFetch(src.queryConfig, schema)
      let datasetId = src.datasetId
      try {
        const saved = await datasetApi.save(src.name, dataset)
        datasetId = saved.id
      } catch { /* offline */ }

      get().updateBigfixSourceDataset(id, dataset, generatedQuery, datasetId)
    },

    async refreshAllBigfixDataSources(schema) {
      const state = get()
      for (const src of state.bigfixDataSources) {
        if (src.queryConfig?.objectType && src.queryConfig?.dimension) {
          await get().refreshBigfixDataSource(src.id, schema)
        }
      }
    },

    async persistBigfixSources() {
      const state = get()
      const out: BigfixDataSource[] = []
      for (const src of state.bigfixDataSources) {
        let datasetId = src.datasetId
        if (src.dataset) {
          try {
            const saved = await datasetApi.save(src.name, src.dataset)
            datasetId = saved.id
          } catch { /* keep existing id */ }
        }
        out.push({
          id: src.id,
          name: src.name,
          queryConfig: src.queryConfig,
          generatedQuery: src.generatedQuery,
          fetchedAt: src.fetchedAt,
          datasetId,
        })
      }
      set((s: any) => ({
        bigfixDataSources: s.bigfixDataSources.map((r: BigfixSourceRuntime) => {
          const p = out.find(o => o.id === r.id)
          return p ? { ...r, datasetId: p.datasetId } : r
        }),
        dashboard: { ...s.dashboard, bigfixDataSources: out },
      }))
      return out
    },
  }
}
