// Slice: undo / redo history + drag snapshot + guide lines

import type { Widget } from "../../types/widgetTypes"

const MAX_HISTORY = 50

export function createHistorySlice(set: any) {
  return {

    beginDrag: () => set((state: any) => ({
      past:   [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
      future: [],
    })),

    undo: () => set((state: any) =>
      !state.past.length ? {} : {
        past:             state.past.slice(0, -1),
        future:           [state.dashboard.widgets, ...state.future].slice(0, MAX_HISTORY),
        dashboard:        { ...state.dashboard, widgets: state.past[state.past.length - 1] as Widget[] },
        selectedWidgetId: null,
        selectedWidgetIds: [],
      }
    ),

    redo: () => set((state: any) =>
      !state.future.length ? {} : {
        past:             [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
        future:           state.future.slice(1),
        dashboard:        { ...state.dashboard, widgets: state.future[0] as Widget[] },
        selectedWidgetId: null,
        selectedWidgetIds: [],
      }
    ),

    setGuideLines: (lines: { vertical: number[]; horizontal: number[] }) =>
      set(() => ({ guideLines: lines })),

  }
}
