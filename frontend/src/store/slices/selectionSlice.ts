// Slice: widget selection state

export function createSelectionSlice(set: any) {
  return {

    selectWidget: (id: string | null) => set(() => ({
      selectedWidgetId: id,
      selectedWidgetIds: id ? [id] : [],
    })),

    addToSelection: (id: string) => set((state: any) => {
      const already = state.selectedWidgetIds.includes(id)
      const newIds  = already
        ? state.selectedWidgetIds.filter((i: string) => i !== id)
        : [...state.selectedWidgetIds, id]
      return {
        selectedWidgetIds: newIds,
        selectedWidgetId:  newIds.length ? newIds[newIds.length - 1] : null,
      }
    }),

    setSelection: (ids: string[]) => set(() => ({
      selectedWidgetIds: ids,
      selectedWidgetId:  ids.length ? ids[ids.length - 1] : null,
    })),

    clearSelection: () => set(() => ({ selectedWidgetId: null, selectedWidgetIds: [] })),

  }
}
