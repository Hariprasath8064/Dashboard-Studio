import { create } from "zustand"
import type { DashboardState, CanvasBackground } from "../types/dashboardTypes"
import type { Widget } from "../types/widgetTypes"
import type { Dataset } from "../types/datasetTypes"

const MAX_HISTORY = 50

interface DashboardStore extends DashboardState {

  // ── existing ──
  addWidget: (widget: Widget) => void
  updateWidget: (widget: Widget) => void
  updateWidgets: (widgets: Widget[]) => void
  deleteWidget: (id: string) => void
  selectWidget: (id: string | null) => void
  setDataset: (dataset: Dataset) => void
  setZoom: (zoom: number) => void
  setShowGrid: (show: boolean) => void
  showGrid: boolean
  renameDashboard: (name: string) => void
  resetDashboard: (data: DashboardState["dashboard"]) => void

  // ── multi-select ──
  selectedWidgetIds: string[]
  addToSelection: (id: string) => void
  setSelection: (ids: string[]) => void
  clearSelection: () => void

  // ── clipboard ──
  clipboard: Widget[]
  copySelected: () => void
  pasteWidgets: () => void
  duplicateSelected: () => void

  // ── history (undo / redo) ──
  past: Widget[][]
  future: Widget[][]
  beginDrag: () => void
  undo: () => void
  redo: () => void

  // ── canvas ──
  updateCanvas: (patch: Partial<{ width: number; height: number }>) => void
  setCanvasBg: (bg: Partial<CanvasBackground>) => void

  // ── bulk delete ──
  deleteSelected: () => void

  // ── smart guide lines (transient UI) ──
  guideLines: { vertical: number[]; horizontal: number[] }
  setGuideLines: (lines: { vertical: number[]; horizontal: number[] }) => void

}

export const useDashboardStore = create<DashboardStore>((set, get) => ({

  dashboard: {
    id: "dashboard-1",
    name: "Untitled Dashboard",
    canvas: { width: 1200, height: 720 },
    dataset: null,
    widgets: [],
    background: { color: "#f4f6f9" }
  },

  selectedWidgetId: null,
  selectedWidgetIds: [],
  zoom: 100,
  showGrid: true,
  clipboard: [],
  past: [],
  future: [],
  guideLines: { vertical: [], horizontal: [] },

  // ── widget mutations ──

  addWidget: (widget) => set((state) => ({
    past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
    future: [],
    dashboard: { ...state.dashboard, widgets: [...state.dashboard.widgets, widget] },
    selectedWidgetId: widget.id,
    selectedWidgetIds: [widget.id]
  })),

  updateWidget: (widget) => set((state) => ({
    dashboard: {
      ...state.dashboard,
      widgets: state.dashboard.widgets.map(w => w.id === widget.id ? widget : w)
    }
  })),

  updateWidgets: (widgets) => set((state) => ({
    dashboard: {
      ...state.dashboard,
      widgets: state.dashboard.widgets.map(w => {
        const upd = widgets.find(u => u.id === w.id)
        return upd || w
      })
    }
  })),

  deleteWidget: (id) => set((state) => ({
    past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
    future: [],
    dashboard: { ...state.dashboard, widgets: state.dashboard.widgets.filter(w => w.id !== id) },
    selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
    selectedWidgetIds: state.selectedWidgetIds.filter(i => i !== id)
  })),

  deleteSelected: () => set((state) =>
    !state.selectedWidgetIds.length ? {} as any : {
      past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: [],
      dashboard: {
        ...state.dashboard,
        widgets: state.dashboard.widgets.filter(w => !state.selectedWidgetIds.includes(w.id))
      },
      selectedWidgetId: null,
      selectedWidgetIds: []
    }
  ),

  // ── selection ──

  selectWidget: (id) => set(() => ({
    selectedWidgetId: id,
    selectedWidgetIds: id ? [id] : []
  })),

  addToSelection: (id) => set((state) => {
    const already = state.selectedWidgetIds.includes(id)
    const newIds = already
      ? state.selectedWidgetIds.filter(i => i !== id)
      : [...state.selectedWidgetIds, id]
    return {
      selectedWidgetIds: newIds,
      selectedWidgetId: newIds.length ? newIds[newIds.length - 1] : null
    }
  }),

  setSelection: (ids) => set(() => ({
    selectedWidgetIds: ids,
    selectedWidgetId: ids.length ? ids[ids.length - 1] : null
  })),

  clearSelection: () => set(() => ({ selectedWidgetId: null, selectedWidgetIds: [] })),

  // ── dataset / settings ──

  setDataset: (dataset) => set((state) => ({
    dashboard: { ...state.dashboard, dataset }
  })),

  setZoom: (zoom) => set(() => ({ zoom })),

  setShowGrid: (show) => set(() => ({ showGrid: show })),

  renameDashboard: (name) => set((state) => ({
    dashboard: { ...state.dashboard, name }
  })),

  resetDashboard: (data) => set(() => ({
    dashboard: { ...data, background: data.background || { color: "#f4f6f9" } },
    selectedWidgetId: null,
    selectedWidgetIds: [],
    clipboard: [],
    past: [],
    future: []
  })),

  // ── canvas ──

  updateCanvas: (patch) => set((state) => ({
    dashboard: { ...state.dashboard, canvas: { ...state.dashboard.canvas, ...patch } }
  })),

  setCanvasBg: (bg) => set((state) => ({
    dashboard: { ...state.dashboard, background: { ...state.dashboard.background, ...bg } }
  })),

  // ── clipboard ──

  copySelected: () => {
    const { dashboard, selectedWidgetIds } = get()
    const toCopy = dashboard.widgets.filter(w => selectedWidgetIds.includes(w.id))
    if (toCopy.length) set(() => ({ clipboard: toCopy }))
  },

  pasteWidgets: () => {
    const { clipboard } = get()
    if (!clipboard.length) return
    const now = Date.now()
    const newWidgets = clipboard.map((w, i) => ({
      ...w,
      id: `w-${now}-${i}`,
      position: { x: Math.min(w.position.x + 20, 900), y: Math.min(w.position.y + 20, 500) },
      zIndex: now + i
    }))
    const newIds = newWidgets.map(w => w.id)
    set((state) => ({
      past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: [],
      dashboard: { ...state.dashboard, widgets: [...state.dashboard.widgets, ...newWidgets] },
      selectedWidgetId: newIds[newIds.length - 1],
      selectedWidgetIds: newIds
    }))
  },

  duplicateSelected: () => {
    const { dashboard, selectedWidgetIds } = get()
    const toDup = dashboard.widgets.filter(w => selectedWidgetIds.includes(w.id))
    if (!toDup.length) return
    const now = Date.now()
    const newWidgets = toDup.map((w, i) => ({
      ...w,
      id: `w-${now}-${i}`,
      position: { x: Math.min(w.position.x + 20, 900), y: Math.min(w.position.y + 20, 500) },
      zIndex: now + i
    }))
    const newIds = newWidgets.map(w => w.id)
    set((state) => ({
      past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: [],
      dashboard: { ...state.dashboard, widgets: [...state.dashboard.widgets, ...newWidgets] },
      selectedWidgetId: newIds[newIds.length - 1],
      selectedWidgetIds: newIds
    }))
  },

  // ── history ──

  beginDrag: () => set((state) => ({
    past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
    future: []
  })),

  undo: () => set((state) =>
    !state.past.length ? {} as any : {
      past: state.past.slice(0, -1),
      future: [state.dashboard.widgets, ...state.future].slice(0, MAX_HISTORY),
      dashboard: { ...state.dashboard, widgets: state.past[state.past.length - 1] },
      selectedWidgetId: null,
      selectedWidgetIds: []
    }
  ),

  redo: () => set((state) =>
    !state.future.length ? {} as any : {
      past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: state.future.slice(1),
      dashboard: { ...state.dashboard, widgets: state.future[0] },
      selectedWidgetId: null,
      selectedWidgetIds: []
    }
  ),

  // ── guide lines ──

  setGuideLines: (lines) => set(() => ({ guideLines: lines }))

}))
