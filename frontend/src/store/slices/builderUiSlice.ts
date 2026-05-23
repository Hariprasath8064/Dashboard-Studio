export type BuilderView = "design" | "preview" | "code" | "query"

export interface BuilderUiSlice {
  builderView: BuilderView
  queryEditorSourceId: string | null
  setBuilderView: (view: BuilderView) => void
  setQueryEditorSourceId: (id: string | null) => void
  openQueryEditor: (sourceId?: string | null) => void
}

export function createBuilderUiSlice(set: any, get: any): BuilderUiSlice {
  return {
    builderView: "design",
    queryEditorSourceId: null,

    setBuilderView: (view) => set(() => ({ builderView: view })),

    setQueryEditorSourceId: (id) => set(() => ({ queryEditorSourceId: id })),

    openQueryEditor: (sourceId) => {
      const state = get()
      const id =
        sourceId ??
        state.queryEditorSourceId ??
        state.activeDataSourceId ??
        state.bigfixDataSources[0]?.id ??
        null
      set(() => ({
        builderView: "query",
        queryEditorSourceId: id,
      }))
    },
  }
}
