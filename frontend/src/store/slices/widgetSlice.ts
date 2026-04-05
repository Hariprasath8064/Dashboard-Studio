// Slice: widget add / update / delete mutations

import type { Widget } from "../../types/widgetTypes"

const MAX_HISTORY = 50

export function createWidgetSlice(set: any) {
  return {

    addWidget: (widget: Widget) => set((state: any) => ({
      past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: [],
      dashboard: { ...state.dashboard, widgets: [...state.dashboard.widgets, widget] },
      selectedWidgetId: widget.id,
      selectedWidgetIds: [widget.id],
    })),

    updateWidget: (widget: Widget) => set((state: any) => ({
      dashboard: {
        ...state.dashboard,
        widgets: state.dashboard.widgets.map((w: Widget) => w.id === widget.id ? widget : w),
      },
    })),

    updateWidgets: (widgets: Widget[]) => set((state: any) => ({
      dashboard: {
        ...state.dashboard,
        widgets: state.dashboard.widgets.map((w: Widget) => {
          const upd = widgets.find(u => u.id === w.id)
          return upd || w
        }),
      },
    })),

    deleteWidget: (id: string) => set((state: any) => ({
      past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: [],
      dashboard: { ...state.dashboard, widgets: state.dashboard.widgets.filter((w: Widget) => w.id !== id) },
      selectedWidgetId:  state.selectedWidgetId === id ? null : state.selectedWidgetId,
      selectedWidgetIds: state.selectedWidgetIds.filter((i: string) => i !== id),
    })),

    deleteSelected: () => set((state: any) =>
      !state.selectedWidgetIds.length ? {} : {
        past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
        future: [],
        dashboard: {
          ...state.dashboard,
          widgets: state.dashboard.widgets.filter((w: Widget) => !state.selectedWidgetIds.includes(w.id)),
        },
        selectedWidgetId:  null,
        selectedWidgetIds: [],
      }
    ),

  }
}
