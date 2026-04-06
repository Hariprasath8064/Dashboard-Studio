package db

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

// Connect opens the SQLite database and runs migrations.
func Connect(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	// SQLite performs best with a single writer connection.
	db.SetMaxOpenConns(1)

	if err := migrate(db); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
		PRAGMA journal_mode = WAL;
		PRAGMA foreign_keys = ON;

		CREATE TABLE IF NOT EXISTS datasets (
			id         TEXT    PRIMARY KEY,
			name       TEXT    NOT NULL,
			row_count  INTEGER NOT NULL DEFAULT 0,
			col_count  INTEGER NOT NULL DEFAULT 0,
			data       TEXT    NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS dashboards (
			id          TEXT PRIMARY KEY,
			name        TEXT NOT NULL,
			dataset_id  TEXT REFERENCES datasets(id) ON DELETE SET NULL,
			canvas_json TEXT NOT NULL DEFAULT '{}',
			created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`)
	return err
}
