import { api } from "./api"
import type { Dataset } from "../types/datasetTypes"

export interface SavedDatasetMeta {
  id: string
  name: string
  row_count: number
  col_count: number
  created_at: string
  updated_at: string
}

export interface SaveDatasetPayload {
  name: string
  row_count: number
  col_count: number
  data: string // JSON.stringify(Dataset)
}

export const datasetApi = {
  list(): Promise<SavedDatasetMeta[]> {
    return api.get("/datasets")
  },

  save(name: string, dataset: Dataset): Promise<SavedDatasetMeta> {
    const payload: SaveDatasetPayload = {
      name,
      row_count: dataset.rows.length,
      col_count: dataset.columns.length,
      data: JSON.stringify(dataset),
    }
    return api.post("/datasets", payload)
  },

  /** Returns the full dataset including the rows blob. */
  get(id: string): Promise<SavedDatasetMeta & { data: string }> {
    return api.get(`/datasets/${id}`)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/datasets/${id}`)
  },
}
