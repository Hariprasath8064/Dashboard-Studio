package models

import "time"

// Dataset is the full DB row for a stored dataset.
type Dataset struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	RowCount  int       `json:"row_count"`
	ColCount  int       `json:"col_count"`
	Data      string    `json:"data"` // raw JSON blob stored only on full GET
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// DatasetListItem is returned in the GET /datasets list (no data blob).
type DatasetListItem struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	RowCount  int       `json:"row_count"`
	ColCount  int       `json:"col_count"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// SaveDatasetRequest is the POST body sent by the frontend.
// `Data` is the raw JSON of { columns: [...], rows: [...] }.
type SaveDatasetRequest struct {
	Name     string `json:"name"`
	RowCount int    `json:"row_count"`
	ColCount int    `json:"col_count"`
	Data     string `json:"data"`
}
