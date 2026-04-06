package handlers

import (
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"dashboard-builder/models"
)

type DashboardHandler struct {
	db *sql.DB
}

func NewDashboardHandler(db *sql.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

// GET /api/dashboards
func (h *DashboardHandler) List(c *fiber.Ctx) error {
	rows, err := h.db.QueryContext(c.Context(), `
		SELECT d.id, d.name, d.dataset_id, ds.name, d.created_at, d.updated_at
		FROM dashboards d
		LEFT JOIN datasets ds ON ds.id = d.dataset_id
		ORDER BY d.updated_at DESC
	`)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	defer rows.Close()

	items := make([]models.DashboardListItem, 0)
	for rows.Next() {
		var item models.DashboardListItem
		if err := rows.Scan(
			&item.ID, &item.Name, &item.DatasetID, &item.DatasetName,
			&item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return fiber.ErrInternalServerError
		}
		items = append(items, item)
	}
	return c.JSON(items)
}

// GET /api/dashboards/:id
func (h *DashboardHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")

	var d models.Dashboard
	err := h.db.QueryRowContext(c.Context(), `
		SELECT id, name, dataset_id, canvas_json, created_at, updated_at
		FROM dashboards WHERE id = ?
	`, id).Scan(&d.ID, &d.Name, &d.DatasetID, &d.CanvasJSON, &d.CreatedAt, &d.UpdatedAt)
	if err == sql.ErrNoRows {
		return fiber.ErrNotFound
	}
	if err != nil {
		return fiber.ErrInternalServerError
	}

	// If the dashboard has an associated dataset, embed the dataset data.
	type response struct {
		models.Dashboard
		Dataset *string `json:"dataset,omitempty"`
	}
	resp := response{Dashboard: d}

	if d.DatasetID != nil {
		var dataJSON string
		err := h.db.QueryRowContext(c.Context(),
			`SELECT data FROM datasets WHERE id = ?`, *d.DatasetID,
		).Scan(&dataJSON)
		if err == nil {
			resp.Dataset = &dataJSON
		}
	}

	return c.JSON(resp)
}

// POST /api/dashboards
func (h *DashboardHandler) Create(c *fiber.Ctx) error {
	var req models.SaveDashboardRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if req.Name == "" || req.CanvasJSON == "" {
		return fiber.NewError(fiber.StatusBadRequest, "name and canvas_json are required")
	}

	id := uuid.NewString()
	now := time.Now().UTC()

	_, err := h.db.ExecContext(c.Context(), `
		INSERT INTO dashboards (id, name, dataset_id, canvas_json, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, id, req.Name, req.DatasetID, req.CanvasJSON, now, now)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":         id,
		"name":       req.Name,
		"dataset_id": req.DatasetID,
		"created_at": now,
		"updated_at": now,
	})
}

// PUT /api/dashboards/:id
func (h *DashboardHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	var req models.SaveDashboardRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if req.Name == "" || req.CanvasJSON == "" {
		return fiber.NewError(fiber.StatusBadRequest, "name and canvas_json are required")
	}

	now := time.Now().UTC()
	res, err := h.db.ExecContext(c.Context(), `
		UPDATE dashboards SET name=?, dataset_id=?, canvas_json=?, updated_at=?
		WHERE id=?
	`, req.Name, req.DatasetID, req.CanvasJSON, now, id)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fiber.ErrNotFound
	}

	return c.JSON(fiber.Map{"id": id, "updated_at": now})
}

// DELETE /api/dashboards/:id
func (h *DashboardHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.db.ExecContext(c.Context(), `DELETE FROM dashboards WHERE id=?`, id)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fiber.ErrNotFound
	}
	return c.SendStatus(fiber.StatusNoContent)
}
