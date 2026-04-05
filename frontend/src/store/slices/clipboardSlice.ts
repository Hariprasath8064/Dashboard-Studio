// Slice: clipboard copy / paste / duplicate

import type { Widget } from "../../types/widgetTypes"

const MAX_HISTORY = 50

export function createClipboardSlice(set: any, get: any) {
  return {

    copySelected: () => {
      const { dashboard, selectedWidgetIds } = get()
      const toCopy = (dashboard.widgets as Widget[]).filter(w => selectedWidgetIds.includes(w.id))
      if (toCopy.length) set(() => ({ clipboard: toCopy }))
    },

    pasteWidgets: () => {
      const { clipboard } = get()
      if (!(clipboard as Widget[]).length) return
      const now = Date.now()
      const newWidgets = (clipboard as Widget[]).map((w, i) => ({
        ...w,
        id:       `w-${now}-${i}`,
        position: { x: Math.min(w.position.x + 20, 900), y: Math.min(w.position.y + 20, 500) },
        zIndex:   now + i,
      }))
      const newIds = newWidgets.map(w => w.id)
      set((state: any) => ({
        past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
        future: [],
        dashboard: { ...state.dashboard, widgets: [...state.dashboard.widgets, ...newWidgets] },
        selectedWidgetId:  newIds[newIds.length - 1],
        selectedWidgetIds: newIds,
      }))
    },

    duplicateSelected: () => {
      const { dashboard, selectedWidgetIds } = get()
      const toDup = (dashboard.widgets as Widget[]).filter(w => selectedWidgetIds.includes(w.id))
      if (!toDup.length) return
      const now = Date.now()
      const newWidgets = toDup.map((w, i) => ({
        ...w,
        id:       `w-${now}-${i}`,
        position: { x: Math.min(w.position.x + 20, 900), y: Math.min(w.position.y + 20, 500) },
        zIndex:   now + i,
      }))
      const newIds = newWidgets.map(w => w.id)
      set((state: any) => ({
        past: [...state.past, state.dashboard.widgets].slice(-MAX_HISTORY),
        future: [],
        dashboard: { ...state.dashboard, widgets: [...state.dashboard.widgets, ...newWidgets] },
        selectedWidgetId:  newIds[newIds.length - 1],
        selectedWidgetIds: newIds,
      }))
    },

  }
}
