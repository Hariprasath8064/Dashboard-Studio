package models

import "time"

// Dashboard is the full DB row for a saved dashboard.
type Dashboard struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	DatasetID  *string   `json:"dataset_id,omitempty"`
	CanvasJSON string    `json:"canvas_json"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// DashboardListItem is returned in the GET /dashboards list
// (lighter – no canvas blob, but with joined dataset name).
type DashboardListItem struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	DatasetID   *string   `json:"dataset_id,omitempty"`
	DatasetName *string   `json:"dataset_name,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// SaveDashboardRequest is the POST/PUT body sent by the frontend.
type SaveDashboardRequest struct {
	Name       string  `json:"name"`
	DatasetID  *string `json:"dataset_id,omitempty"`
	CanvasJSON string  `json:"canvas_json"`
}
