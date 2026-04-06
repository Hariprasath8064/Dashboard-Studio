import { api } from "./api"

export interface DashboardMeta {
  id: string
  name: string
  dataset_id: string | null
  dataset_name: string | null
  created_at: string
  updated_at: string
}

export interface SaveDashboardPayload {
  name: string
  dataset_id?: string | null
  canvas_json: string // JSON.stringify of full canvas / widget state
}

export interface LoadedDashboard {
  id: string
  name: string
  dataset_id: string | null
  canvas_json: string
  /** Stringified Dataset JSON embedded by the backend when loading. */
  dataset?: string
  created_at: string
  updated_at: string
}

export const dashboardApi = {
  list(): Promise<DashboardMeta[]> {
    return api.get("/dashboards")
  },

  get(id: string): Promise<LoadedDashboard> {
    return api.get(`/dashboards/${id}`)
  },

  create(payload: SaveDashboardPayload): Promise<DashboardMeta> {
    return api.post("/dashboards", payload)
  },

  update(id: string, payload: SaveDashboardPayload): Promise<{ id: string; updated_at: string }> {
    return api.put(`/dashboards/${id}`, payload)
  },

  delete(id: string): Promise<void> {
    return api.delete(`/dashboards/${id}`)
  },
}
