package routes

import (
	"github.com/gofiber/fiber/v2"

	"dashboard-builder/handlers"
)

// Register mounts all API routes onto the fiber app.
func Register(app *fiber.App, dh *handlers.DashboardHandler, ds *handlers.DatasetHandler) {
	api := app.Group("/api")

	// ── Dashboards ──────────────────────────────────────────
	dashboards := api.Group("/dashboards")
	dashboards.Get("/", dh.List)
	dashboards.Post("/", dh.Create)
	dashboards.Get("/:id", dh.Get)
	dashboards.Put("/:id", dh.Update)
	dashboards.Delete("/:id", dh.Delete)

	// ── Datasets ─────────────────────────────────────────────
	datasets := api.Group("/datasets")
	datasets.Get("/", ds.List)
	datasets.Post("/", ds.Save)
	datasets.Get("/:id", ds.Get)
	datasets.Delete("/:id", ds.Delete)
}
