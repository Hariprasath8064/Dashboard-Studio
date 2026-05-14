import { create } from "zustand"
import type { DashboardState, CanvasBackground } from "../types/dashboardTypes"
import type { Widget } from "../types/widgetTypes"
import type { Dataset } from "../types/datasetTypes"
import type { BigfixSchema, BigfixQueryConfig } from "../types/bigfixTypes"
import { createWidgetSlice }    from "./slices/widgetSlice"
import { createSelectionSlice } from "./slices/selectionSlice"
import { createClipboardSlice } from "./slices/clipboardSlice"
import { createHistorySlice }   from "./slices/historySlice"
import { createCanvasSlice }    from "./slices/canvasSlice"

interface DashboardStore extends DashboardState {

  // ── widget mutations ──
  addWidget: (widget: Widget) => void
  updateWidget: (widget: Widget) => void
  updateWidgets: (widgets: Widget[]) => void
  deleteWidget: (id: string) => void
  deleteSelected: () => void

  // ── selection ──
  selectedWidgetIds: string[]
  selectWidget: (id: string | null) => void
  addToSelection: (id: string) => void
  setSelection: (ids: string[]) => void
  clearSelection: () => void

  // ── clipboard ──
  clipboard: Widget[]
  copySelected: () => void
  pasteWidgets: () => void
  duplicateSelected: () => void

  // ── history ──
  past: Widget[][]
  future: Widget[][]
  beginDrag: () => void
  undo: () => void
  redo: () => void

  // ── guide lines ──
  guideLines: { vertical: number[]; horizontal: number[] }
  setGuideLines: (lines: { vertical: number[]; horizontal: number[] }) => void

  // ── canvas / settings ──
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

  // ── BigFix ──
  /** Inspector schema loaded from backend — ephemeral, not saved to DB */
  bigfixSchema: BigfixSchema | null
  setBigfixMode: (mode: boolean) => void
  setBigfixSchema: (schema: BigfixSchema) => void
  setBigfixQueryConfig: (config: BigfixQueryConfig) => void

}

export const useDashboardStore = create<DashboardStore>((set, get) => ({

  // ── initial state ──
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
  bigfixSchema:      null,

  // ── slices ──
  ...createWidgetSlice(set),
  ...createSelectionSlice(set),
  ...createClipboardSlice(set, get),
  ...createHistorySlice(set),
  ...createCanvasSlice(set),

  // ── BigFix actions ──
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

}))
