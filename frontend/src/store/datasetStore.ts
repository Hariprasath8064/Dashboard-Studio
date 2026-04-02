import { create } from "zustand"
import type { Dataset } from "../types/datasetTypes"

interface DatasetStore {

  dataset: Dataset | null

  selectedColumn: string | null

  setDataset: (dataset: Dataset) => void

  selectColumn: (column: string) => void

}

export const useDatasetStore = create<DatasetStore>((set) => ({

  dataset: null,

  selectedColumn: null,

  setDataset: (dataset) =>
    set(() => ({
      dataset
    })),

  selectColumn: (column) =>
    set(() => ({
      selectedColumn: column
    }))

}))