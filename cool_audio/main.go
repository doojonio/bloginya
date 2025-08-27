package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	config, err := LoadConfig("config.json")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	http.HandleFunc("/upload", uploadHandler(config))
	http.HandleFunc("/stream/", streamHandler(config))
	http.HandleFunc("/health", healthHandler)

	log.Println("Server starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func uploadHandler(config *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request for %s", r.URL.Path)
		if r.Method != http.MethodPost {
			log.Printf("Method not allowed: %s", r.Method)
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		file, header, err := r.FormFile("audio")
		if err != nil {
			log.Printf("Failed to get file from form: %v", err)
			http.Error(w, "Failed to get file from form", http.StatusBadRequest)
			return
		}
		defer file.Close()

		if header.Size < config.MinFileSize {
			log.Printf("File size is too small: %d bytes", header.Size)
			http.Error(w, fmt.Sprintf("File size is too small. Minimum size is %d bytes", config.MinFileSize), http.StatusBadRequest)
			return
		}

		if header.Size > config.MaxFileSize {
			log.Printf("File size is too large: %d bytes", header.Size)
			http.Error(w, fmt.Sprintf("File size is too large. Maximum size is %d bytes", config.MaxFileSize), http.StatusBadRequest)
			return
		}

		contentType := header.Header.Get("Content-Type")
		allowed := false
		for _, t := range config.AllowedMediaTypes {
			if t == contentType {
				allowed = true
				break
			}
		}

		if !allowed {
			log.Printf("Media type not allowed: %s", contentType)
			http.Error(w, fmt.Sprintf("Media type '%s' not allowed", contentType), http.StatusUnsupportedMediaType)
			return
		}

		ext := filepath.Ext(header.Filename)
		randomBytes := make([]byte, 16)
		_, err = rand.Read(randomBytes)
		if err != nil {
			log.Printf("Failed to generate random bytes for filename: %v", err)
			http.Error(w, "Failed to generate unique filename", http.StatusInternalServerError)
			return
		}
		filename := hex.EncodeToString(randomBytes) + ext

		f, err := os.Create(filepath.Join(config.UploadDir, filename))
		if err != nil {
			log.Printf("Failed to save file: %v", err)
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}
		defer f.Close()

		_, err = io.Copy(f, file)
		if err != nil {
			log.Printf("Failed to save file: %v", err)
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}

		log.Printf("File '%s' uploaded successfully as '%s'", header.Filename, filename)
		fmt.Fprintf(w, "File '%s' uploaded successfully as '%s'", header.Filename, filename)
	}
}

func streamHandler(config *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request for %s", r.URL.Path)
		filename := filepath.Base(r.URL.Path)
		filePath := filepath.Join(config.UploadDir, filename)

		log.Printf("Streaming file %s", filePath)
		http.ServeFile(w, r, filePath)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Received request for %s", r.URL.Path)
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "OK")
}
