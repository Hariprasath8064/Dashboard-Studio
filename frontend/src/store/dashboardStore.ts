import { create } from "zustand"
import type { DashboardState, CanvasBackground } from "../types/dashboardTypes"
import type { Widget } from "../types/widgetTypes"
import type { Dataset } from "../types/datasetTypes"
import type { BigfixSchema, BigfixQueryConfig } from "../types/bigfixTypes"
import type { ThemeConfig } from "../theme/themePresets"

export interface DrillDownPayload {
  widgetTitle: string
  filterLabel: string | null
  filterColumn: string | null
  displayColumns: string[]
  dataSourceId?: string | null
}
import { createWidgetSlice }    from "./slices/widgetSlice"
import { createSelectionSlice } from "./slices/selectionSlice"
import { createClipboardSlice } from "./slices/clipboardSlice"
import { createHistorySlice }   from "./slices/historySlice"
import { createCanvasSlice }    from "./slices/canvasSlice"
import { createBigfixSourceSlice, type BigfixSourceSlice } from "./bigfixSourceSlice"

interface DashboardStore extends DashboardState, BigfixSourceSlice {

  addWidget: (widget: Widget) => void
  updateWidget: (widget: Widget) => void
  updateWidgets: (widgets: Widget[]) => void
  deleteWidget: (id: string) => void
  deleteSelected: () => void

  selectedWidgetIds: string[]
  selectWidget: (id: string | null) => void
  addToSelection: (id: string) => void
  setSelection: (ids: string[]) => void
  clearSelection: () => void

  clipboard: Widget[]
  copySelected: () => void
  pasteWidgets: () => void
  duplicateSelected: () => void

  past: Widget[][]
  future: Widget[][]
  beginDrag: () => void
  undo: () => void
  redo: () => void

  guideLines: { vertical: number[]; horizontal: number[] }
  setGuideLines: (lines: { vertical: number[]; horizontal: number[] }) => void

  datasetName: string | null
  savedDashboardId: string | null
  savedDatasetId:   string | null
  zoom: number
  showGrid: boolean
  updateCanvas: (patch: Partial<{ width: number; height: number }>) => void
  setCanvasBg: (bg: Partial<CanvasBackground>) => void
  setDataset: (dataset: Dataset, name: string, datasetId?: string | null) => void
  setZoom: (zoom: number) => void
  setShowGrid: (show: boolean) => void
  renameDashboard: (name: string) => void
  resetDashboard: (data: DashboardState["dashboard"]) => void
  setSavedDashboardId: (id: string | null) => void
  setSavedDatasetId:   (id: string | null) => void

  bigfixSchema: BigfixSchema | null
  bigfixPendingRefresh: boolean
  setBigfixMode: (mode: boolean) => void
  setBigfixSchema: (schema: BigfixSchema) => void
  setBigfixQueryConfig: (config: BigfixQueryConfig) => void
  setBigfixFetchedAt: (ts: string) => void
  setBigfixPendingRefresh: (v: boolean) => void

  setTheme: (theme: ThemeConfig) => void

  drillDown: DrillDownPayload | null
  openDrillDown: (payload: DrillDownPayload) => void
  closeDrillDown: () => void

}

const widgetSliceFactory = createWidgetSlice
const canvasSliceFactory = createCanvasSlice

export const useDashboardStore = create<DashboardStore>((set, get) => {
  const widgetSlice  = widgetSliceFactory(set)
  const canvasSlice  = canvasSliceFactory(set)
  const bigfixSlice  = createBigfixSourceSlice(set, get)

  return {

  dashboard: {
    id: "dashboard-1",
    name: "Untitled Dashboard",
    canvas: { width: 1200, height: 720 },
    dataset: null,
    widgets: [],
    background: { color: "#f4f6f9" },
    bigfixMode: false,
  },
  selectedWidgetId:  null,
  selectedWidgetIds: [],
  zoom:              100,
  showGrid:          true,
  clipboard:         [],
  past:              [],
  future:            [],
  guideLines:        { vertical: [], horizontal: [] },
  datasetName:       null,
  bigfixSchema:         null,
  bigfixPendingRefresh: false,
  drillDown:            null,

  ...widgetSlice,
  ...createSelectionSlice(set),
  ...createClipboardSlice(set, get),
  ...createHistorySlice(set),
  ...canvasSlice,
  ...bigfixSlice,

  addWidget: (widget: Widget) => {
    const state = get()
    const w =
      state.dashboard.bigfixMode && state.activeDataSourceId && !widget.dataSourceId
        ? { ...widget, dataSourceId: state.activeDataSourceId }
        : widget
    widgetSlice.addWidget(w)
  },

  resetDashboard: (data) => {
    set(() => ({
      dashboard: { ...data, background: data.background || { color: "#f4f6f9" } },
      selectedWidgetId:  null,
      selectedWidgetIds: [],
      clipboard:         [],
      past:              [],
      future:            [],
      bigfixDataSources: [],
      activeDataSourceId: data.activeDataSourceId ?? null,
    }))
  },

  setBigfixMode: (mode: boolean) =>
    set((state: any) => ({
      dashboard: { ...state.dashboard, bigfixMode: mode },
    })),

  setBigfixSchema: (schema: BigfixSchema) =>
    set(() => ({ bigfixSchema: schema })),

  setBigfixQueryConfig: (config: BigfixQueryConfig) =>
    set((state: any) => ({
      dashboard: { ...state.dashboard, bigfixQueryConfig: config },
    })),

  setBigfixFetchedAt: (ts: string) =>
    set((state: any) => ({
      dashboard: { ...state.dashboard, bigfixFetchedAt: ts },
    })),

  setBigfixPendingRefresh: (v: boolean) =>
    set(() => ({ bigfixPendingRefresh: v })),

  setTheme: (theme: ThemeConfig) =>
    set((state: any) => ({
      dashboard: {
        ...state.dashboard,
        theme,
        background: { ...state.dashboard.background, color: theme.dashboardBg },
      },
    })),

  openDrillDown:  (payload) => set(() => ({ drillDown: payload })),
  closeDrillDown: ()        => set(() => ({ drillDown: null })),

  }
})
