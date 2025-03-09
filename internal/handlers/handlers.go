package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"panchikawatte.lk/internal/database"
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
	// Parse multipart form data with 10MB limit
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Get form values
	userType := r.FormValue("userType")
	fullName := r.FormValue("fullName")
	email := r.FormValue("email")
	phone := r.FormValue("phone")
	password := r.FormValue("password")

	// Validate required fields
	if fullName == "" || email == "" || phone == "" || password == "" || userType == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Check if email already exists
	existingUser, err := database.GetUserByEmail(email)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if existingUser.ID != "" {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, err := hashPassword(password)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create new user
	user := models.User{
		ID:          uuid.New().String(),
		FullName:    fullName,
		Email:       email,
		Phone:       phone,
		Password:    hashedPassword,
		Type:        userType,
		IsVerified:  false,
		CreatedAt:   time.Now(),
		LastLoginAt: time.Now(),
		Credits:     0, // Initial credits
	}

	// Handle supplier-specific fields
	if userType == "supplier" {
		businessName := r.FormValue("businessName")
		businessRegNumber := r.FormValue("businessRegNumber")
		vatNumber := r.FormValue("vatNumber")
		businessAddress := r.FormValue("businessAddress")
		district := r.FormValue("district")
		specializations := r.Form["specializations[]"]

		// Validate required supplier fields
		if businessName == "" || businessRegNumber == "" || businessAddress == "" || district == "" || len(specializations) == 0 {
			http.Error(w, "Missing required supplier fields", http.StatusBadRequest)
			return
		}

		// Handle business registration document
		businessRegDoc, header, err := r.FormFile("businessRegistrationDoc")
		if err != nil {
			http.Error(w, "Business registration document is required", http.StatusBadRequest)
			return
		}
		defer businessRegDoc.Close()

		// Validate file size and type
		if header.Size > maxFileSize {
			http.Error(w, "Business registration document is too large (max 5MB)", http.StatusBadRequest)
			return
		}

		// Save business registration document
		filename := fmt.Sprintf("business_reg_%s%s", user.ID, path.Ext(header.Filename))
		filepath := path.Join("static/uploads", filename)
		dst, err := os.Create(filepath)
		if err != nil {
			http.Error(w, "Error saving business registration document", http.StatusInternalServerError)
			return
		}
		defer dst.Close()
		if _, err := io.Copy(dst, businessRegDoc); err != nil {
			http.Error(w, "Error saving business registration document", http.StatusInternalServerError)
			return
		}

		// Handle VAT certificate if provided
		var vatCertificateURL string
		if vatFile, vatHeader, err := r.FormFile("vatCertificate"); err == nil {
			defer vatFile.Close()
			if vatHeader.Size <= maxFileSize {
				vatFilename := fmt.Sprintf("vat_%s%s", user.ID, path.Ext(vatHeader.Filename))
				vatFilepath := path.Join("static/uploads", vatFilename)
				if dst, err := os.Create(vatFilepath); err == nil {
					defer dst.Close()
					if _, err := io.Copy(dst, vatFile); err == nil {
						vatCertificateURL = "/static/uploads/" + vatFilename
					}
				}
			}
		}

		// Update user with supplier fields
		user.BusinessName = businessName
		user.BusinessRegNumber = businessRegNumber
		user.VatNumber = vatNumber
		user.BusinessAddress = businessAddress
		user.District = district
		user.Specializations = specializations
		user.BusinessRegDocURL = "/static/uploads/" + filename
		user.VatCertificateURL = vatCertificateURL
	}

	// Save user to database
	if err := database.CreateUser(user); err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	response := models.APIResponse{
		Success: true,
		Message: "Registration successful",
		Data: map[string]interface{}{
			"userId":   user.ID,
			"userType": user.Type,
		},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Find user by email
	user, err := database.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
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

	if err := database.SaveVerificationCode(req.PhoneNumber, code); err != nil {
		http.Error(w, "Error saving verification code", http.StatusInternalServerError)
		return
	}

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

	storedCode, err := database.GetVerificationCode(req.PhoneNumber)
	if err != nil || storedCode != req.Code {
		http.Error(w, "Invalid verification code", http.StatusBadRequest)
		return
	}

	// Delete the verification code
	if err := database.DeleteVerificationCode(req.PhoneNumber); err != nil {
		http.Error(w, "Error deleting verification code", http.StatusInternalServerError)
		return
	}

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
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
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
		ext := path.Ext(header.Filename)
		filename := fmt.Sprintf("%s_%s%s", uuid.New().String(), view, ext)
		filepath := path.Join("static/uploads", filename)

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

	if err := database.CreatePartRequest(partRequest); err != nil {
		http.Error(w, "Error creating part request", http.StatusInternalServerError)
		return
	}

	response := models.APIResponse{
		Success: true,
		Message: "Part request created successfully",
		Data:    partRequest,
	}
	json.NewEncoder(w).Encode(response)
}

func GetPartRequestsHandler(w http.ResponseWriter, r *http.Request) {
	requests, err := database.GetPartRequests()
	if err != nil {
		http.Error(w, "Error fetching part requests", http.StatusInternalServerError)
		return
	}

	response := models.APIResponse{
		Success: true,
		Data:    requests,
	}
	json.NewEncoder(w).Encode(response)
}

func GetPartRequestHandler(w http.ResponseWriter, r *http.Request) {
	// Extract request ID from URL path
	requestID := strings.TrimPrefix(r.URL.Path, "/api/parts/requests/")

	request, err := database.GetPartRequestByID(requestID)
	if err != nil {
		http.Error(w, "Part request not found", http.StatusNotFound)
		return
	}

	response := models.APIResponse{
		Success: true,
		Data:    request,
	}
	json.NewEncoder(w).Encode(response)
}

func CreateQuoteHandler(w http.ResponseWriter, r *http.Request) {
	var req models.CreateQuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get user ID from token
	supplierID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

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

	if err := database.CreateQuote(quote); err != nil {
		http.Error(w, "Error creating quote", http.StatusInternalServerError)
		return
	}

	response := models.APIResponse{
		Success: true,
		Message: "Quote submitted successfully",
		Data:    quote,
	}
	json.NewEncoder(w).Encode(response)
}

func UpdateRequestStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from token
	userID, err := getUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		RequestID string `json:"requestId"`
		Status    string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the request to verify ownership
	request, err := database.GetPartRequestByID(req.RequestID)
	if err != nil {
		http.Error(w, "Part request not found", http.StatusNotFound)
		return
	}

	// Verify that the user is the owner of the request
	if request.UserID != userID {
		http.Error(w, "Unauthorized to update this request", http.StatusForbidden)
		return
	}

	// Validate status
	validStatuses := map[string]bool{
		"open":           true,
		"received_offer": true,
		"purchased":      true,
		"completed":      true,
	}

	if !validStatuses[req.Status] {
		http.Error(w, "Invalid status", http.StatusBadRequest)
		return
	}

	// Update the status
	if err := database.UpdateRequestStatus(req.RequestID, req.Status); err != nil {
		http.Error(w, "Error updating request status", http.StatusInternalServerError)
		return
	}

	response := models.APIResponse{
		Success: true,
		Message: "Request status updated successfully",
		Data:    request,
	}
	w.Header().Set("Content-Type", "application/json")
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

func getUserIDFromToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("authorization header required")
	}

	tokenString := ""
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	} else {
		return "", fmt.Errorf("invalid authorization format")
	}

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		return "", fmt.Errorf("invalid token claims")
	}

	return userID, nil
}
