package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
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
	if err := http.ListenAndServe(":8080", accessLogMiddleware(http.DefaultServeMux)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func accessLogMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("access log: %s %s %s", r.RemoteAddr, r.Method, r.URL)
		next.ServeHTTP(w, r)
	})
}

func uploadHandler(config *Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request for %s", r.URL.Path)
		if r.Method != http.MethodPost {
			httpError(w, nil, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}

		sidCookie, err := r.Cookie("sid")
		if err != nil {
			httpError(w, err, http.StatusBadRequest, "Failed to get sid cookie")
			return
		}

		allowedToUpload, err := isAllowedToUpload(config.PolicyServiceURL, sidCookie.Value)
		if err != nil {
			httpError(w, err, http.StatusInternalServerError, "Failed to check policy")
			return
		}
		if !allowedToUpload {
			httpError(w, nil, http.StatusForbidden, "Upload not allowed by policy")
			return
		}

		file, header, err := r.FormFile("audio")
		if err != nil {
			httpError(w, err, http.StatusBadRequest, "Failed to get file from form")
			return
		}
		defer file.Close()

		if header.Size < config.MinFileSize {
			httpError(w, nil, http.StatusBadRequest, fmt.Sprintf("File size is too small. Minimum size is %d bytes", config.MinFileSize))
			return
		}

		if header.Size > config.MaxFileSize {
			httpError(w, nil, http.StatusBadRequest, fmt.Sprintf("File size is too large. Maximum size is %d bytes", config.MaxFileSize))
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
			httpError(w, nil, http.StatusUnsupportedMediaType, fmt.Sprintf("Media type '%s' not allowed", contentType))
			return
		}

		ext := filepath.Ext(header.Filename)
		randomBytes := make([]byte, 16)
		_, err = rand.Read(randomBytes)
		if err != nil {
			httpError(w, err, http.StatusInternalServerError, "Failed to generate unique filename")
			return
		}
		filename := hex.EncodeToString(randomBytes) + ext

		f, err := os.Create(filepath.Join(config.UploadDir, filename))
		if err != nil {
			httpError(w, err, http.StatusInternalServerError, "Failed to save file")
			return
		}
		defer f.Close()

		_, err = io.Copy(f, file)
		if err != nil {
			httpError(w, err, http.StatusInternalServerError, "Failed to save file")
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

func isAllowedToUpload(policyURL, sid string) (bool, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", policyURL+"/can_upload_audio", nil)
	if err != nil {
		return false, fmt.Errorf("failed to create request: %w", err)
	}
	req.AddCookie(&http.Cookie{Name: "sid", Value: sid})

	resp, err := client.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to get policy: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("policy service returned non-200 status code: %d", resp.StatusCode)
	}

	var result = struct {
		Authorized int `json:"authorized"`
	}{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return false, fmt.Errorf("failed to decode policy response: %w", err)
	}

	return result.Authorized == 1, nil
}

func httpError(w http.ResponseWriter, err error, statusCode int, message string) {
	if err != nil {
		log.Printf("error: %v", err)
	}
	http.Error(w, message, statusCode)
}
