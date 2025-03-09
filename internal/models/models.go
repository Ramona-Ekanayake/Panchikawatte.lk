package models

import (
	"time"
)

type User struct {
	ID          string    `json:"id"`
	FullName    string    `json:"fullName"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	Password    string    `json:"password"`
	Type        string    `json:"type"` // "customer" or "supplier"
	IsVerified  bool      `json:"isVerified"`
	CreatedAt   time.Time `json:"createdAt"`
	LastLoginAt time.Time `json:"lastLoginAt"`
	Credits     float64   `json:"credits"`
	// Supplier specific fields
	BusinessName      string   `json:"businessName,omitempty"`
	BusinessRegNumber string   `json:"businessRegNumber,omitempty"`
	VatNumber         string   `json:"vatNumber,omitempty"`
	BusinessAddress   string   `json:"businessAddress,omitempty"`
	District          string   `json:"district,omitempty"`
	Specializations   []string `json:"specializations,omitempty"`
	BusinessRegDocURL string   `json:"businessRegDocURL,omitempty"`
	VatCertificateURL string   `json:"vatCertificateURL,omitempty"`
}

type PartRequest struct {
	ID            string            `json:"id"`
	UserID        string            `json:"userId"`
	VehicleModel  string            `json:"vehicleModel"`
	ChassisNumber string            `json:"chassisNumber"`
	PartNumber    string            `json:"partNumber"`
	PartCategory  string            `json:"partCategory"`
	PartName      string            `json:"partName"`
	Description   string            `json:"description"`
	ImageURLs     map[string]string `json:"imageUrls"` // keys: "left", "right", "top", "bottom"
	CreatedAt     time.Time         `json:"createdAt"`
	Status        string            `json:"status"` // "open", "closed", "in-progress"
	Quotes        []Quote           `json:"quotes"`
}

type Quote struct {
	ID         string    `json:"id"`
	RequestID  string    `json:"requestId"`
	SupplierID string    `json:"supplierId"`
	Price      float64   `json:"price"`
	Currency   string    `json:"currency"`
	Condition  string    `json:"condition"` // new, used, refurbished
	Notes      string    `json:"notes"`
	CreatedAt  time.Time `json:"createdAt"`
	Status     string    `json:"status"` // "pending", "accepted", "rejected"
}

type PhoneVerification struct {
	PhoneNumber string    `json:"phoneNumber"`
	Code        string    `json:"code"`
	ExpiresAt   time.Time `json:"expiresAt"`
}

// Request/Response structures
type RegisterRequest struct {
	UserType string `json:"userType"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
	// Supplier specific fields
	BusinessName      string   `json:"businessName,omitempty"`
	BusinessRegNumber string   `json:"businessRegNumber,omitempty"`
	VatNumber         string   `json:"vatNumber,omitempty"`
	BusinessAddress   string   `json:"businessAddress,omitempty"`
	District          string   `json:"district,omitempty"`
	Specializations   []string `json:"specializations,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type VerifyPhoneRequest struct {
	PhoneNumber string `json:"phoneNumber"`
}

type VerifyCodeRequest struct {
	PhoneNumber string `json:"phoneNumber"`
	Code        string `json:"code"`
}

type CreatePartRequestRequest struct {
	VehicleModel  string `json:"vehicleModel"`
	ChassisNumber string `json:"chassisNumber"`
	PartNumber    string `json:"partNumber"`
	PartName      string `json:"partName"`
	Description   string `json:"description"`
}

type CreateQuoteRequest struct {
	RequestID string  `json:"requestId"`
	Price     float64 `json:"price"`
	Currency  string  `json:"currency"`
	Condition string  `json:"condition"`
	Notes     string  `json:"notes"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
