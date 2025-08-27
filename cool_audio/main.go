package main

import (
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
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		file, header, err := r.FormFile("audio")
		if err != nil {
			http.Error(w, "Failed to get file from form", http.StatusBadRequest)
			return
		}
		defer file.Close()

		if header.Size < config.MinFileSize {
			http.Error(w, fmt.Sprintf("File size is too small. Minimum size is %d bytes", config.MinFileSize), http.StatusBadRequest)
			return
		}

		if header.Size > config.MaxFileSize {
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
			http.Error(w, fmt.Sprintf("Media type '%s' not allowed", contentType), http.StatusUnsupportedMediaType)
			return
		}

		f, err := os.Create(filepath.Join(config.UploadDir, header.Filename))
		if err != nil {
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}
		defer f.Close()

		_, err = io.Copy(f, file)
		if err != nil {
			http.Error(w, "Failed to save file", http.StatusInternalServerError)
			return
		}

		fmt.Fprintf(w, "File '%s' uploaded successfully", header.Filename)
	}
}

func streamHandler(config *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filename := filepath.Base(r.URL.Path)
		filePath := filepath.Join(config.UploadDir, filename)

		http.ServeFile(w, r, filePath)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "OK")
}
