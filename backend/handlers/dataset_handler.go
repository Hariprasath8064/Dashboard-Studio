package handlers

import (
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"dashboard-builder/models"
)

type DatasetHandler struct {
	db *sql.DB
}

func NewDatasetHandler(db *sql.DB) *DatasetHandler {
	return &DatasetHandler{db: db}
}

// GET /api/datasets
func (h *DatasetHandler) List(c *fiber.Ctx) error {
	rows, err := h.db.QueryContext(c.Context(), `
		SELECT id, name, row_count, col_count, created_at, updated_at
		FROM datasets ORDER BY updated_at DESC
	`)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	defer rows.Close()

	items := make([]models.DatasetListItem, 0)
	for rows.Next() {
		var item models.DatasetListItem
		if err := rows.Scan(
			&item.ID, &item.Name, &item.RowCount, &item.ColCount,
			&item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return fiber.ErrInternalServerError
		}
		items = append(items, item)
	}
	return c.JSON(items)
}

// GET /api/datasets/:id  — returns full dataset including data blob
func (h *DatasetHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")

	var ds models.Dataset
	err := h.db.QueryRowContext(c.Context(), `
		SELECT id, name, row_count, col_count, data, created_at, updated_at
		FROM datasets WHERE id = ?
	`, id).Scan(&ds.ID, &ds.Name, &ds.RowCount, &ds.ColCount, &ds.Data, &ds.CreatedAt, &ds.UpdatedAt)
	if err == sql.ErrNoRows {
		return fiber.ErrNotFound
	}
	if err != nil {
		return fiber.ErrInternalServerError
	}
	return c.JSON(ds)
}

// POST /api/datasets  — frontend sends parsed JSON dataset
func (h *DatasetHandler) Save(c *fiber.Ctx) error {
	var req models.SaveDatasetRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if req.Name == "" || req.Data == "" {
		return fiber.NewError(fiber.StatusBadRequest, "name and data are required")
	}

	id := uuid.NewString()
	now := time.Now().UTC()

	_, err := h.db.ExecContext(c.Context(), `
		INSERT INTO datasets (id, name, row_count, col_count, data, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, id, req.Name, req.RowCount, req.ColCount, req.Data, now, now)
	if err != nil {
		return fiber.ErrInternalServerError
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":         id,
		"name":       req.Name,
		"row_count":  req.RowCount,
		"col_count":  req.ColCount,
		"created_at": now,
		"updated_at": now,
	})
}

// DELETE /api/datasets/:id
func (h *DatasetHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.db.ExecContext(c.Context(), `DELETE FROM datasets WHERE id=?`, id)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fiber.ErrNotFound
	}
	return c.SendStatus(fiber.StatusNoContent)
}
