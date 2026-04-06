// Slice: canvas geometry, background, dataset, zoom, grid, naming

import type { CanvasBackground } from "../../types/dashboardTypes"
import type { Dataset } from "../../types/datasetTypes"

export function createCanvasSlice(set: any) {
  return {

    // IDs of the records saved to the backend (null = never saved)
    savedDashboardId: null as string | null,
    savedDatasetId:   null as string | null,

    setSavedDashboardId: (id: string | null) => set(() => ({ savedDashboardId: id })),
    setSavedDatasetId:   (id: string | null) => set(() => ({ savedDatasetId:   id })),


    updateCanvas: (patch: Partial<{ width: number; height: number }>) =>
      set((state: any) => ({
        dashboard: { ...state.dashboard, canvas: { ...state.dashboard.canvas, ...patch } },
      })),

    setCanvasBg: (bg: Partial<CanvasBackground>) =>
      set((state: any) => ({
        dashboard: { ...state.dashboard, background: { ...state.dashboard.background, ...bg } },
      })),

    setDataset: (dataset: Dataset, name: string, datasetId?: string | null) =>
      set((state: any) => ({
        dashboard:      { ...state.dashboard, dataset },
        datasetName:    name,
        savedDatasetId: datasetId !== undefined ? datasetId : state.savedDatasetId,
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
