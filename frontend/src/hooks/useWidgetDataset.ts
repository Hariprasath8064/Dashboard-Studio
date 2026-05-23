import { createContext, useContext } from "react"
import { useDashboardStore } from "../store/dashboardStore"
import type { Dataset } from "../types/datasetTypes"
import type { Widget } from "../types/widgetTypes"

const WidgetDatasetContext = createContext<Dataset | null | undefined>(undefined)

export const WidgetDatasetProvider = WidgetDatasetContext.Provider

export function useWidgetDataset(widget?: Pick<Widget, "dataSourceId">): Dataset | null {
  const fromContext = useContext(WidgetDatasetContext)
  const fromStore = useDashboardStore(s =>
    widget ? s.getDatasetForWidget(widget) : s.dashboard.dataset
  )
  if (fromContext !== undefined) return fromContext
  return fromStore
}
