export type BuilderView = "design" | "preview" | "code" | "query"

const LS_LEFT_COLLAPSED = "dashboardStudio.leftPanelCollapsed"
const LS_RIGHT_COLLAPSED = "dashboardStudio.rightPanelCollapsed"

function readStoredCollapsed(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true"
  } catch {
    return false
  }
}

function writeStoredCollapsed(key: string, collapsed: boolean) {
  try {
    localStorage.setItem(key, String(collapsed))
  } catch {
    /* ignore quota / private mode */
  }
}

export interface BuilderUiSlice {
  builderView: BuilderView
  queryEditorSourceId: string | null
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  setBuilderView: (view: BuilderView) => void
  setQueryEditorSourceId: (id: string | null) => void
  openQueryEditor: (sourceId?: string | null) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
}

export function createBuilderUiSlice(set: any, get: any): BuilderUiSlice {
  return {
    builderView: "design",
    queryEditorSourceId: null,
    leftPanelCollapsed: readStoredCollapsed(LS_LEFT_COLLAPSED),
    rightPanelCollapsed: readStoredCollapsed(LS_RIGHT_COLLAPSED),

    toggleLeftPanel: () =>
      set((state: BuilderUiSlice) => {
        const next = !state.leftPanelCollapsed
        writeStoredCollapsed(LS_LEFT_COLLAPSED, next)
        return { leftPanelCollapsed: next }
      }),

    toggleRightPanel: () =>
      set((state: BuilderUiSlice) => {
        const next = !state.rightPanelCollapsed
        writeStoredCollapsed(LS_RIGHT_COLLAPSED, next)
        return { rightPanelCollapsed: next }
      }),

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
