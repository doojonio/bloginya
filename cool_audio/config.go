package main

import (
	"encoding/json"
	"os"
)

// Config holds the application configuration
type Config struct {
	MaxFileSize           int64    `json:"max_file_size"`
	MinFileSize           int64    `json:"min_file_size"`
	AllowedMediaTypes     []string `json:"allowed_media_types"`
	UploadDir             string   `json:"upload_dir"`
	PolicyServiceURL      string   `json:"policy_service_url"`
	PolicyServiceEndpoint string   `json:"policy_service_endpoint"`
	BackendAPIKey         string   `json:"backend_api_key"`
	BackendURL            string   `json:"backend_url"`
}

// LoadConfig loads the configuration from a file
func LoadConfig(path string) (*Config, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	config := &Config{}
	decoder := json.NewDecoder(file)
	err = decoder.Decode(config)
	if err != nil {
		return nil, err
	}

	return config, nil
}
