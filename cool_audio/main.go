package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
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

		policyResult, err := getUploadPolicy(config.PolicyServiceURL, sidCookie.Value)
		if err != nil {
			httpError(w, err, http.StatusInternalServerError, "Failed to check policy")
			return
		}
		if !policyResult.Authorized {
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

		// Check file size based on policy limits
		if policyResult.MaxFileSize > 0 && header.Size > policyResult.MaxFileSize {
			httpError(w, nil, http.StatusBadRequest, fmt.Sprintf("File size is too large. Maximum size is %d bytes", policyResult.MaxFileSize))
			return
		}

		// Check duration if limit is set
		if policyResult.MaxDurationSeconds > 0 {
			duration, err := getAudioDuration(file, header.Filename)
			if err != nil {
				log.Printf("Warning: Failed to get audio duration: %v", err)
				// Continue anyway, but log the error
			} else if duration > float64(policyResult.MaxDurationSeconds) {
				httpError(w, nil, http.StatusBadRequest, fmt.Sprintf("Audio duration is too long. Maximum duration is %d seconds", policyResult.MaxDurationSeconds))
				return
			}
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
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message":  fmt.Sprintf("File '%s' uploaded successfully", header.Filename),
			"file_id":  filename,
			"filename": header.Filename,
		})
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

type PolicyResult struct {
	Authorized        int    `json:"authorized"`
	MaxFileSize       int64  `json:"max_file_size"`
	MaxDurationSeconds int   `json:"max_duration_seconds"`
	Role              string `json:"role"`
}

func getUploadPolicy(policyURL, sid string) (*PolicyResult, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", policyURL+"/can_upload_audio", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.AddCookie(&http.Cookie{Name: "sid", Value: sid})

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get policy: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("policy service returned non-200 status code: %d", resp.StatusCode)
	}

	var result PolicyResult
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("failed to decode policy response: %w", err)
	}

	return &result, nil
}

func getAudioDuration(file multipart.File, filename string) (float64, error) {
	// Create a temporary file to store the uploaded audio
	tmpFile, err := os.CreateTemp("", "audio-*"+filepath.Ext(filename))
	if err != nil {
		return 0, fmt.Errorf("failed to create temp file: %w", err)
	}
	defer os.Remove(tmpFile.Name())
	defer tmpFile.Close()

	// Reset file pointer to beginning
	file.Seek(0, 0)

	// Copy file content to temp file
	_, err = io.Copy(tmpFile, file)
	if err != nil {
		return 0, fmt.Errorf("failed to copy file: %w", err)
	}
	tmpFile.Close()

	// Reset file pointer for later use
	file.Seek(0, 0)

	// Use ffprobe to get duration (if available)
	cmd := exec.Command("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", tmpFile.Name())
	output, err := cmd.Output()
	if err != nil {
		// ffprobe not available or failed, return error
		return 0, fmt.Errorf("ffprobe not available or failed: %w", err)
	}

	durationStr := strings.TrimSpace(string(output))
	duration, err := strconv.ParseFloat(durationStr, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse duration: %w", err)
	}

	return duration, nil
}

func httpError(w http.ResponseWriter, err error, statusCode int, message string) {
	if err != nil {
		log.Printf("error: %v", err)
	}
	http.Error(w, message, statusCode)
}
