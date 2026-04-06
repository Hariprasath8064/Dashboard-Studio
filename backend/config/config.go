package config

import "os"

// Config holds all runtime configuration for the server.
type Config struct {
	Port   string
	DBPath string
}

// Load reads config from environment variables with sensible defaults.
func Load() *Config {
	return &Config{
		Port:   getEnv("PORT", "8080"),
		DBPath: getEnv("DB_PATH", "./dashboard_studio.db"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
