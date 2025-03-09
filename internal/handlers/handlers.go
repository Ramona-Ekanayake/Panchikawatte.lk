package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"panchikawatte.lk/internal/models"
)

// Mock storage
var (
	users             = make(map[string]models.User)
	partRequests      = make(map[string]models.PartRequest)
	verificationCodes = make(map[string]string) // phone -> code
	mu                sync.RWMutex
	jwtKey            = []byte("your-secret-key")
)

const maxFileSize = 5 << 20 // 5MB

func init() {
	// Create uploads directory if it doesn't exist
	os.MkdirAll("static/uploads", 0755)
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// Check if email already exists
	for _, user := range users {
		if user.Email == req.Email {
			http.Error(w, "Email already registered", http.StatusConflict)
			return
		}
	}

	// Hash password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create new user
	user := models.User{
		ID:          uuid.New().String(),
		FullName:    req.FullName,
		IDNumber:    req.IDNumber,
		Email:       req.Email,
		Phone:       req.Phone,
		Password:    hashedPassword,
		IsVerified:  false,
		CreatedAt:   time.Now(),
		LastLoginAt: time.Now(),
	}

	users[user.ID] = user

	response := models.APIResponse{
		Success: true,
		Message: "Registration successful",
	}
	json.NewEncoder(w).Encode(response)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mu.RLock()
	defer mu.RUnlock()

	// Find user by email
	var user models.User
	for _, u := range users {
		if u.Email == req.Email {
			user = u
			break
		}
	}

	if user.ID == "" {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check password
	if !checkPasswordHash(req.Password, user.Password) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate token
	token, err := generateToken(user.ID)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	response := models.APIResponse{
		Success: true,
		Message: "Login successful",
		Data: map[string]string{
			"token": token,
		},
	}
	json.NewEncoder(w).Encode(response)
}

func VerifyPhoneHandler(w http.ResponseWriter, r *http.Request) {
	var req models.VerifyPhoneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Generate mock verification code
	code := "123456" // In production, generate a random code

	mu.Lock()
	verificationCodes[req.PhoneNumber] = code
	mu.Unlock()

	// In production, send SMS here
	response := models.APIResponse{
		Success: true,
		Message: "Verification code sent (mock: 123456)",
	}
	json.NewEncoder(w).Encode(response)
}

func VerifyCodeHandler(w http.ResponseWriter, r *http.Request) {
	var req models.VerifyCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	storedCode, exists := verificationCodes[req.PhoneNumber]
	if !exists || storedCode != req.Code {
		http.Error(w, "Invalid verification code", http.StatusBadRequest)
		return
	}

	// Mark phone as verified for the user
	for id, user := range users {
		if user.Phone == req.PhoneNumber {
			user.IsVerified = true
			users[id] = user
			break
		}
	}

	delete(verificationCodes, req.PhoneNumber)

	response := models.APIResponse{
		Success: true,
		Message: "Phone number verified",
	}
	json.NewEncoder(w).Encode(response)
}

func CreatePartRequestHandler(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form with 10MB max memory
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Get token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header required", http.StatusUnauthorized)
		return
	}

	// Extract token from "Bearer <token>"
	tokenString := ""
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	} else {
		http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
		return
	}

	// Parse and validate token
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Get user ID from token
	userID, ok := claims["user_id"].(string)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Get form values
	vehicleModel := r.FormValue("vehicleModel")
	chassisNumber := r.FormValue("chassisNumber")
	partNumber := r.FormValue("partNumber")
	partCategory := r.FormValue("partCategory")
	partName := r.FormValue("partName")
	description := r.FormValue("description")

	// Handle image uploads
	imageURLs := make(map[string]string)
	views := []string{"left", "right", "top", "bottom"}

	for _, view := range views {
		file, header, err := r.FormFile("image_" + view)
		if err != nil {
			if err == http.ErrMissingFile {
				continue
			}
			http.Error(w, "Error processing image upload", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Check file size
		if header.Size > maxFileSize {
			http.Error(w, fmt.Sprintf("File %s is too large. Maximum size is 5MB", header.Filename), http.StatusBadRequest)
			return
		}

		// Generate unique filename
		ext := filepath.Ext(header.Filename)
		filename := fmt.Sprintf("%s_%s%s", uuid.New().String(), view, ext)
		filepath := filepath.Join("static/uploads", filename)

		// Create the file
		dst, err := os.Create(filepath)
		if err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Copy the uploaded file
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}

		// Add the URL to the map
		imageURLs[view] = "/static/uploads/" + filename
	}

	partRequest := models.PartRequest{
		ID:            uuid.New().String(),
		UserID:        userID,
		VehicleModel:  vehicleModel,
		ChassisNumber: chassisNumber,
		PartNumber:    partNumber,
		PartCategory:  partCategory,
		PartName:      partName,
		Description:   description,
		ImageURLs:     imageURLs,
		CreatedAt:     time.Now(),
		Status:        "open",
		Quotes:        []models.Quote{},
	}

	mu.Lock()
	partRequests[partRequest.ID] = partRequest
	mu.Unlock()

	response := models.APIResponse{
		Success: true,
		Message: "Part request created successfully",
		Data:    partRequest,
	}
	json.NewEncoder(w).Encode(response)
}

func GetPartRequestsHandler(w http.ResponseWriter, r *http.Request) {
	mu.RLock()
	defer mu.RUnlock()

	requests := make([]models.PartRequest, 0, len(partRequests))
	for _, req := range partRequests {
		requests = append(requests, req)
	}

	response := models.APIResponse{
		Success: true,
		Data:    requests,
	}
	json.NewEncoder(w).Encode(response)
}

// Add new handler for quotes
func CreateQuoteHandler(w http.ResponseWriter, r *http.Request) {
	var req models.CreateQuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Authorization header required", http.StatusUnauthorized)
		return
	}

	// Extract token from "Bearer <token>"
	tokenString := ""
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	} else {
		http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
		return
	}

	// Parse and validate token
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Get user ID from token
	supplierID, ok := claims["user_id"].(string)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	// Find the part request
	partRequest, exists := partRequests[req.RequestID]
	if !exists {
		http.Error(w, "Part request not found", http.StatusNotFound)
		return
	}

	// Create new quote
	quote := models.Quote{
		ID:         uuid.New().String(),
		RequestID:  req.RequestID,
		SupplierID: supplierID,
		Price:      req.Price,
		Currency:   req.Currency,
		Condition:  req.Condition,
		Notes:      req.Notes,
		CreatedAt:  time.Now(),
		Status:     "pending",
	}

	// Add quote to the request
	partRequest.Quotes = append(partRequest.Quotes, quote)
	partRequests[req.RequestID] = partRequest

	response := models.APIResponse{
		Success: true,
		Message: "Quote submitted successfully",
		Data:    quote,
	}
	json.NewEncoder(w).Encode(response)
}

// Add handler to get single part request
func GetPartRequestHandler(w http.ResponseWriter, r *http.Request) {
	// Extract request ID from URL path
	requestID := r.URL.Path[len("/api/parts/requests/"):]

	mu.RLock()
	defer mu.RUnlock()

	request, exists := partRequests[requestID]
	if !exists {
		http.Error(w, "Part request not found", http.StatusNotFound)
		return
	}

	response := models.APIResponse{
		Success: true,
		Data:    request,
	}
	json.NewEncoder(w).Encode(response)
}

// Helper functions

func generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
