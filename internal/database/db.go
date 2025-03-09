package database

import (
	"database/sql"
	"log"
	"os"
	"path"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	// Create data directory if it doesn't exist
	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatal(err)
	}

	// Open SQLite database
	var err error
	DB, err = sql.Open("sqlite3", path.Join("data", "panchikawatte.db"))
	if err != nil {
		log.Fatal(err)
	}

	// Create tables if they don't exist
	createTables()
}

func createTables() {
	// Users table
	_, err := DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			full_name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			phone TEXT NOT NULL,
			password TEXT NOT NULL,
			type TEXT NOT NULL,
			is_verified BOOLEAN DEFAULT FALSE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			last_login_at DATETIME,
			credits INTEGER DEFAULT 0
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Suppliers table (extends users)
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS suppliers (
			user_id TEXT PRIMARY KEY,
			business_name TEXT NOT NULL,
			business_reg_number TEXT NOT NULL,
			vat_number TEXT,
			business_address TEXT NOT NULL,
			district TEXT NOT NULL,
			business_reg_doc_url TEXT NOT NULL,
			vat_certificate_url TEXT,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Supplier specializations
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS supplier_specializations (
			supplier_id TEXT,
			specialization TEXT,
			PRIMARY KEY (supplier_id, specialization),
			FOREIGN KEY (supplier_id) REFERENCES suppliers(user_id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Part requests
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS part_requests (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			vehicle_model TEXT NOT NULL,
			chassis_number TEXT NOT NULL,
			part_number TEXT NOT NULL,
			part_category TEXT NOT NULL,
			part_name TEXT NOT NULL,
			description TEXT,
			status TEXT DEFAULT 'open',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Part request images
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS request_images (
			request_id TEXT,
			view TEXT,
			image_url TEXT,
			PRIMARY KEY (request_id, view),
			FOREIGN KEY (request_id) REFERENCES part_requests(id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Quotes
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS quotes (
			id TEXT PRIMARY KEY,
			request_id TEXT NOT NULL,
			supplier_id TEXT NOT NULL,
			price DECIMAL(10,2) NOT NULL,
			currency TEXT NOT NULL,
			condition TEXT NOT NULL,
			notes TEXT,
			status TEXT DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (request_id) REFERENCES part_requests(id),
			FOREIGN KEY (supplier_id) REFERENCES suppliers(user_id)
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	// Phone verification codes
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS verification_codes (
			phone TEXT PRIMARY KEY,
			code TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal(err)
	}
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
