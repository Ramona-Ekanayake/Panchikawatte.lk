package database

import (
	"database/sql"
	"time"

	"panchikawatte.lk/internal/models"
)

// User operations
func CreateUser(user models.User) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert into users table
	_, err = tx.Exec(`
		INSERT INTO users (id, full_name, email, phone, password, type, is_verified, created_at, last_login_at, credits)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, user.ID, user.FullName, user.Email, user.Phone, user.Password, user.Type, user.IsVerified, user.CreatedAt, user.LastLoginAt, user.Credits)
	if err != nil {
		return err
	}

	// If user is a supplier, insert supplier-specific information
	if user.Type == "supplier" {
		_, err = tx.Exec(`
			INSERT INTO suppliers (user_id, business_name, business_reg_number, vat_number, business_address, district, business_reg_doc_url, vat_certificate_url)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`, user.ID, user.BusinessName, user.BusinessRegNumber, user.VatNumber, user.BusinessAddress, user.District, user.BusinessRegDocURL, user.VatCertificateURL)
		if err != nil {
			return err
		}

		// Insert specializations
		for _, spec := range user.Specializations {
			_, err = tx.Exec(`
				INSERT INTO supplier_specializations (supplier_id, specialization)
				VALUES (?, ?)
			`, user.ID, spec)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func GetUserByEmail(email string) (models.User, error) {
	var user models.User
	err := DB.QueryRow(`
		SELECT id, full_name, email, phone, password, type, is_verified, created_at, last_login_at, credits
		FROM users WHERE email = ?
	`, email).Scan(&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Password, &user.Type, &user.IsVerified, &user.CreatedAt, &user.LastLoginAt, &user.Credits)

	if err == sql.ErrNoRows {
		return user, nil
	}
	if err != nil {
		return user, err
	}

	if user.Type == "supplier" {
		err = loadSupplierInfo(&user)
	}
	return user, err
}

func GetUserByID(id string) (models.User, error) {
	var user models.User
	err := DB.QueryRow(`
		SELECT id, full_name, email, phone, password, type, is_verified, created_at, last_login_at, credits
		FROM users WHERE id = ?
	`, id).Scan(&user.ID, &user.FullName, &user.Email, &user.Phone, &user.Password, &user.Type, &user.IsVerified, &user.CreatedAt, &user.LastLoginAt, &user.Credits)

	if err == sql.ErrNoRows {
		return user, nil
	}
	if err != nil {
		return user, err
	}

	if user.Type == "supplier" {
		err = loadSupplierInfo(&user)
	}
	return user, err
}

func loadSupplierInfo(user *models.User) error {
	// Load supplier information
	err := DB.QueryRow(`
		SELECT business_name, business_reg_number, vat_number, business_address, district, business_reg_doc_url, vat_certificate_url
		FROM suppliers WHERE user_id = ?
	`, user.ID).Scan(&user.BusinessName, &user.BusinessRegNumber, &user.VatNumber, &user.BusinessAddress, &user.District, &user.BusinessRegDocURL, &user.VatCertificateURL)
	if err != nil {
		return err
	}

	// Load specializations
	rows, err := DB.Query(`
		SELECT specialization FROM supplier_specializations WHERE supplier_id = ?
	`, user.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	var specializations []string
	for rows.Next() {
		var spec string
		if err := rows.Scan(&spec); err != nil {
			return err
		}
		specializations = append(specializations, spec)
	}
	user.Specializations = specializations
	return rows.Err()
}

// Part request operations
func CreatePartRequest(request models.PartRequest) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert part request
	_, err = tx.Exec(`
		INSERT INTO part_requests (id, user_id, vehicle_model, chassis_number, part_number, part_category, part_name, description, status, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, request.ID, request.UserID, request.VehicleModel, request.ChassisNumber, request.PartNumber, request.PartCategory, request.PartName, request.Description, request.Status, request.CreatedAt)
	if err != nil {
		return err
	}

	// Insert images
	for view, url := range request.ImageURLs {
		_, err = tx.Exec(`
			INSERT INTO request_images (request_id, view, image_url)
			VALUES (?, ?, ?)
		`, request.ID, view, url)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func GetPartRequests() ([]models.PartRequest, error) {
	rows, err := DB.Query(`
		SELECT id, user_id, vehicle_model, chassis_number, part_number, part_category, part_name, description, status, created_at
		FROM part_requests ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests []models.PartRequest
	for rows.Next() {
		var req models.PartRequest
		err := rows.Scan(&req.ID, &req.UserID, &req.VehicleModel, &req.ChassisNumber, &req.PartNumber, &req.PartCategory, &req.PartName, &req.Description, &req.Status, &req.CreatedAt)
		if err != nil {
			return nil, err
		}

		// Load images
		req.ImageURLs = make(map[string]string)
		imgRows, err := DB.Query(`
			SELECT view, image_url FROM request_images WHERE request_id = ?
		`, req.ID)
		if err != nil {
			return nil, err
		}
		defer imgRows.Close()

		for imgRows.Next() {
			var view, url string
			if err := imgRows.Scan(&view, &url); err != nil {
				return nil, err
			}
			req.ImageURLs[view] = url
		}

		// Load quotes
		quotesRows, err := DB.Query(`
			SELECT id, supplier_id, price, currency, condition, notes, status, created_at
			FROM quotes WHERE request_id = ?
		`, req.ID)
		if err != nil {
			return nil, err
		}
		defer quotesRows.Close()

		for quotesRows.Next() {
			var quote models.Quote
			err := quotesRows.Scan(&quote.ID, &quote.SupplierID, &quote.Price, &quote.Currency, &quote.Condition, &quote.Notes, &quote.Status, &quote.CreatedAt)
			if err != nil {
				return nil, err
			}
			req.Quotes = append(req.Quotes, quote)
		}

		requests = append(requests, req)
	}
	return requests, rows.Err()
}

func GetPartRequestByID(id string) (models.PartRequest, error) {
	var req models.PartRequest
	err := DB.QueryRow(`
		SELECT id, user_id, vehicle_model, chassis_number, part_number, part_category, part_name, description, status, created_at
		FROM part_requests WHERE id = ?
	`, id).Scan(&req.ID, &req.UserID, &req.VehicleModel, &req.ChassisNumber, &req.PartNumber, &req.PartCategory, &req.PartName, &req.Description, &req.Status, &req.CreatedAt)
	if err != nil {
		return req, err
	}

	// Load images
	req.ImageURLs = make(map[string]string)
	imgRows, err := DB.Query(`
		SELECT view, image_url FROM request_images WHERE request_id = ?
	`, id)
	if err != nil {
		return req, err
	}
	defer imgRows.Close()

	for imgRows.Next() {
		var view, url string
		if err := imgRows.Scan(&view, &url); err != nil {
			return req, err
		}
		req.ImageURLs[view] = url
	}

	// Load quotes
	quotesRows, err := DB.Query(`
		SELECT id, supplier_id, price, currency, condition, notes, status, created_at
		FROM quotes WHERE request_id = ?
	`, id)
	if err != nil {
		return req, err
	}
	defer quotesRows.Close()

	for quotesRows.Next() {
		var quote models.Quote
		err := quotesRows.Scan(&quote.ID, &quote.SupplierID, &quote.Price, &quote.Currency, &quote.Condition, &quote.Notes, &quote.Status, &quote.CreatedAt)
		if err != nil {
			return req, err
		}
		req.Quotes = append(req.Quotes, quote)
	}

	return req, nil
}

func UpdateRequestStatus(id string, status string) error {
	_, err := DB.Exec(`
		UPDATE part_requests SET status = ? WHERE id = ?
	`, status, id)
	return err
}

// Quote operations
func CreateQuote(quote models.Quote) error {
	_, err := DB.Exec(`
		INSERT INTO quotes (id, request_id, supplier_id, price, currency, condition, notes, status, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, quote.ID, quote.RequestID, quote.SupplierID, quote.Price, quote.Currency, quote.Condition, quote.Notes, quote.Status, quote.CreatedAt)
	return err
}

// Verification code operations
func SaveVerificationCode(phone, code string) error {
	_, err := DB.Exec(`
		INSERT OR REPLACE INTO verification_codes (phone, code, created_at)
		VALUES (?, ?, ?)
	`, phone, code, time.Now())
	return err
}

func GetVerificationCode(phone string) (string, error) {
	var code string
	err := DB.QueryRow(`
		SELECT code FROM verification_codes WHERE phone = ?
	`, phone).Scan(&code)
	return code, err
}

func DeleteVerificationCode(phone string) error {
	_, err := DB.Exec(`
		DELETE FROM verification_codes WHERE phone = ?
	`, phone)
	return err
}
