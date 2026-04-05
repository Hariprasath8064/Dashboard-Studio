// Slice: canvas geometry, background, dataset, zoom, grid, naming

import type { CanvasBackground } from "../../types/dashboardTypes"
import type { Dataset } from "../../types/datasetTypes"

export function createCanvasSlice(set: any) {
  return {

    updateCanvas: (patch: Partial<{ width: number; height: number }>) =>
      set((state: any) => ({
        dashboard: { ...state.dashboard, canvas: { ...state.dashboard.canvas, ...patch } },
      })),

    setCanvasBg: (bg: Partial<CanvasBackground>) =>
      set((state: any) => ({
        dashboard: { ...state.dashboard, background: { ...state.dashboard.background, ...bg } },
      })),

    setDataset: (dataset: Dataset, name: string) =>
      set((state: any) => ({
        dashboard:   { ...state.dashboard, dataset },
        datasetName: name,
      })),

    setZoom: (zoom: number) => set(() => ({ zoom })),

    setShowGrid: (show: boolean) => set(() => ({ showGrid: show })),

    renameDashboard: (name: string) =>
      set((state: any) => ({
        dashboard: { ...state.dashboard, name },
      })),

    resetDashboard: (data: any) =>
      set(() => ({
        dashboard:         { ...data, background: data.background || { color: "#f4f6f9" } },
        selectedWidgetId:  null,
        selectedWidgetIds: [],
        clipboard:         [],
        past:              [],
        future:            [],
      })),

  }
}
