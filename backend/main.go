package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"dashboard-builder/config"
	"dashboard-builder/db"
	"dashboard-builder/handlers"
	"dashboard-builder/middleware"
	"dashboard-builder/routes"
)

func main() {
	// Load .env if present (silently ignored if missing).
	_ = godotenv.Load()
	cfg := config.Load()

	database, err := db.Connect(cfg.DBPath)
	if err != nil {
		log.Fatalf("database init failed: %v", err)
	}
	defer database.Close()

	app := fiber.New(fiber.Config{
		// Return structured JSON errors instead of plain-text panic output.
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(middleware.CORS)

	// Routes
	dashboardHandler := handlers.NewDashboardHandler(database)
	datasetHandler := handlers.NewDatasetHandler(database)
	routes.Register(app, dashboardHandler, datasetHandler)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	log.Printf("Dashboard Studio API listening on :%s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
