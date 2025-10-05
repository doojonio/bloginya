package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestUploadHandler(t *testing.T) {
	// Create a mock policy server
	policyServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("sid")
		if err != nil {
			http.Error(w, "missing sid", http.StatusBadRequest)
			return
		}
		if cookie.Value == "authorized-sid" {
			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, `{"authorized": 1}`)
		} else {
			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, `{"authorized": 0}`)
		}
	}))
	defer policyServer.Close()

	// Create a temporary directory for uploads
	tmpDir, err := os.MkdirTemp("", "uploads")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Create a config for the test
	config := &Config{
		MaxFileSize:       1024, // 1KB
		MinFileSize:       10,   // 10 bytes
		AllowedMediaTypes: []string{"audio/mpeg"},
		UploadDir:         tmpDir,
		PolicyServiceURL:  policyServer.URL,
	}

	// Create a temporary audio file
	tmpFile, err := os.CreateTemp("", "test.mp3")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpFile.Name())

	// Write content to the file to satisfy min size
	fileContent := []byte("test audio data of sufficient size")
	if _, err := tmpFile.Write(fileContent); err != nil {
		t.Fatal(err)
	}
	tmpFile.Close()

	// Create a file that is too small
	smallFile, err := os.CreateTemp("", "small.mp3")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(smallFile.Name())
	smallFile.Write([]byte("small"))
	smallFile.Close()

	// Create a file that is too large
	largeFile, err := os.CreateTemp("", "large.mp3")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(largeFile.Name())
	largeFile.Write(make([]byte, config.MaxFileSize+1))
	largeFile.Close()

	tt := []struct {
		name                string
		method              string
		sid                 string
		filePath            string
		mediaType           string
		wantStatusCode      int
		wantBodyContains    string
		expectUploadSuccess bool
	}{
		{
			name:                "success",
			method:              http.MethodPost,
			sid:                 "authorized-sid",
			filePath:            tmpFile.Name(),
			mediaType:           "audio/mpeg",
			wantStatusCode:      http.StatusOK,
			wantBodyContains:    "uploaded successfully",
			expectUploadSuccess: true,
		},
		{
			name:           "method not allowed",
			method:         http.MethodGet,
			sid:            "authorized-sid",
			filePath:       tmpFile.Name(),
			mediaType:      "audio/mpeg",
			wantStatusCode: http.StatusMethodNotAllowed,
		},
		{
			name:           "no sid cookie",
			method:         http.MethodPost,
			filePath:       tmpFile.Name(),
			mediaType:      "audio/mpeg",
			wantStatusCode: http.StatusBadRequest,
		},
		{
			name:           "policy denies",
			method:         http.MethodPost,
			sid:            "unauthorized-sid",
			filePath:       tmpFile.Name(),
			mediaType:      "audio/mpeg",
			wantStatusCode: http.StatusForbidden,
		},
		{
			name:           "file too small",
			method:         http.MethodPost,
			sid:            "authorized-sid",
			filePath:       smallFile.Name(),
			mediaType:      "audio/mpeg",
			wantStatusCode: http.StatusBadRequest,
		},
		{
			name:           "file too large",
			method:         http.MethodPost,
			sid:            "authorized-sid",
			filePath:       largeFile.Name(),
			mediaType:      "audio/mpeg",
			wantStatusCode: http.StatusBadRequest,
		},
		{
			name:           "media type not allowed",
			method:         http.MethodPost,
			sid:            "authorized-sid",
			filePath:       tmpFile.Name(),
			mediaType:      "image/jpeg",
			wantStatusCode: http.StatusUnsupportedMediaType,
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			// Before each test, ensure the upload directory is clean
			files, _ := os.ReadDir(tmpDir)
			for _, f := range files {
				os.Remove(filepath.Join(tmpDir, f.Name()))
			}

			body := &bytes.Buffer{}
			writer := multipart.NewWriter(body)
			if tc.filePath != "" {
				h := make(textproto.MIMEHeader)
				h.Set("Content-Disposition",
					fmt.Sprintf(`form-data; name="%s"; filename="%s"`,
						"audio", filepath.Base(tc.filePath)))
				h.Set("Content-Type", tc.mediaType)
				part, err := writer.CreatePart(h)
				if err != nil {
					t.Fatal(err)
				}
				file, err := os.Open(tc.filePath)
				if err != nil {
					t.Fatal(err)
				}
				defer file.Close()
				_, err = io.Copy(part, file)
				if err != nil {
					t.Fatal(err)
				}
			}
			writer.Close()

			req := httptest.NewRequest(tc.method, "/upload", body)
			req.Header.Set("Content-Type", writer.FormDataContentType())
			if tc.sid != "" {
				req.AddCookie(&http.Cookie{Name: "sid", Value: tc.sid})
			}

			rr := httptest.NewRecorder()
			handler := uploadHandler(config)
			handler.ServeHTTP(rr, req)

			if status := rr.Code; status != tc.wantStatusCode {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, tc.wantStatusCode)
			}

			if tc.wantBodyContains != "" {
				if !strings.Contains(rr.Body.String(), tc.wantBodyContains) {
					t.Errorf("handler returned unexpected body: got %v want to contain %v",
						rr.Body.String(), tc.wantBodyContains)
				}
			}

			if tc.expectUploadSuccess {
				// Check if file was created
				files, err := os.ReadDir(tmpDir)
				if err != nil {
					t.Fatal(err)
				}
				if len(files) != 1 {
					t.Errorf("expected 1 file to be uploaded, but found %d", len(files))
				}
			} else {
				// Check that no file was created
				files, err := os.ReadDir(tmpDir)
				if err != nil {
					t.Fatal(err)
				}
				if len(files) != 0 {
					t.Errorf("expected 0 files to be uploaded, but found %d", len(files))
				}
			}
		})
	}
}

func TestStreamHandler(t *testing.T) {
	// Create a temporary directory for uploads
	tmpDir, err := os.MkdirTemp("", "uploads")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Create a config for the test
	config := &Config{
		UploadDir: tmpDir,
	}

	// Create a temporary audio file
	tmpFile, err := os.Create(filepath.Join(tmpDir, "test.mp3"))
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpFile.Name())

	fileContent := []byte("test audio data")
	if _, err := tmpFile.Write(fileContent); err != nil {
		t.Fatal(err)
	}
	tmpFile.Close()

	// Create a new HTTP request
	req := httptest.NewRequest("GET", "/stream/test.mp3", nil)

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()

	// Create the handler and serve the request
	handler := streamHandler(config)
	handler.ServeHTTP(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the response body
	if !bytes.Equal(rr.Body.Bytes(), fileContent) {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), string(fileContent))
	}
}

func TestHealthHandler(t *testing.T) {
	req, err := http.NewRequest("GET", "/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(healthHandler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	expected := "OK\n"
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

func TestIsAllowedToUpload(t *testing.T) {
	// Create a mock policy server
	policyServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/can_upload_audio" {
			http.NotFound(w, r)
			return
		}
		cookie, err := r.Cookie("sid")
		if err != nil {
			http.Error(w, "missing sid cookie", http.StatusBadRequest)
			return
		}
		if cookie.Value == "authorized-sid" {
			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, `{"authorized": 1}`)
		} else if cookie.Value == "unauthorized-sid" {
			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, `{"authorized": 0}`)
		} else if cookie.Value == "bad-response-sid" {
			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, `{"authorized": "bad"}`)
		} else {
			http.Error(w, "unknown sid", http.StatusBadRequest)
		}
	}))
	defer policyServer.Close()

	tt := []struct {
		name          string
		sid           string
		wantAllowed   bool
		wantErr       bool
		policyHandler http.HandlerFunc
	}{
		{
			name:        "allowed",
			sid:         "authorized-sid",
			wantAllowed: true,
			wantErr:     false,
		},
		{
			name:        "not allowed",
			sid:         "unauthorized-sid",
			wantAllowed: false,
			wantErr:     false,
		},
		{
			name:        "policy server error",
			sid:         "any-sid",
			wantAllowed: false,
			wantErr:     true,
			policyHandler: func(w http.ResponseWriter, r *http.Request) {
				http.Error(w, "internal server error", http.StatusInternalServerError)
			},
		},
		{
			name:        "bad response from policy server",
			sid:         "bad-response-sid",
			wantAllowed: false,
			wantErr:     true,
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			policyURL := policyServer.URL
			if tc.policyHandler != nil {
				customPolicyServer := httptest.NewServer(tc.policyHandler)
				defer customPolicyServer.Close()
				policyURL = customPolicyServer.URL
			}

			allowed, err := isAllowedToUpload(policyURL, tc.sid)
			if (err != nil) != tc.wantErr {
				t.Errorf("isAllowedToUpload() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			if allowed != tc.wantAllowed {
				t.Errorf("isAllowedToUpload() = %v, want %v", allowed, tc.wantAllowed)
			}
		})
	}
}

func TestAccessLogMiddleware(t *testing.T) {
	var buf bytes.Buffer
	log.SetOutput(&buf)
	defer func() {
		log.SetOutput(os.Stderr)
	}()

	// Create a mock handler
	mockHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Create a new HTTP request
	req := httptest.NewRequest("GET", "/test", nil)
	req.RemoteAddr = "1.2.3.4:1234"

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()

	// Create the middleware and serve the request
	middleware := accessLogMiddleware(mockHandler)
	middleware.ServeHTTP(rr, req)

	// Check the status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the log output
	expectedLog := "access log: 1.2.3.4:1234 GET /test"
	if !strings.Contains(buf.String(), expectedLog) {
		t.Errorf("log output wrong: got %q want to contain %q", buf.String(), expectedLog)
	}
}
