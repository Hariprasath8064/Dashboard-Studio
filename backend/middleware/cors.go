package middleware

import "github.com/gofiber/fiber/v2/middleware/cors"

// CORSConfig returns a CORS middleware that allows the Vite dev server
// (and any origin in development). Tighten AllowOrigins in production.
var CORS = cors.New(cors.Config{
	AllowOrigins: "*",
	AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	AllowHeaders: "Origin,Content-Type,Accept",
})
