package main

import (
	"log"
	"net/http"
	"os"
	"path"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"panchikawatte.lk/internal/database"
	"panchikawatte.lk/internal/handlers"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	database.InitDB()
	defer database.CloseDB()

	// Create router
	r := mux.NewRouter()

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	// API routes
	r.HandleFunc("/api/register", handlers.RegisterHandler).Methods("POST")
	r.HandleFunc("/api/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/api/verify-phone", handlers.VerifyPhoneHandler).Methods("POST")
	r.HandleFunc("/api/verify-code", handlers.VerifyCodeHandler).Methods("POST")
	r.HandleFunc("/api/parts/request", handlers.CreatePartRequestHandler).Methods("POST")
	r.HandleFunc("/api/parts/requests", handlers.GetPartRequestsHandler).Methods("GET")
	r.HandleFunc("/api/parts/requests/{id}", handlers.GetPartRequestHandler).Methods("GET")
	r.HandleFunc("/api/parts/quotes", handlers.CreateQuoteHandler).Methods("POST")
	r.HandleFunc("/api/parts/requests/{id}/status", handlers.UpdateRequestStatusHandler).Methods("PUT")

	// Serve index.html for all other routes
	r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, path.Join("templates", "index.html"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}

// Handler functions
func handleRegister(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement registration logic
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement login logic
}

func handleVerifyPhone(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement phone verification logic
}

func handleVerifyCode(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement verification code validation
}

func handlePartRequest(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement part request creation
}

func handleGetPartRequests(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement fetching part requests
}
