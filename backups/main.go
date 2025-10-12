package main

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

var config struct {
	Paths []string `json:"paths"`
	// pgDumpCommand string
}

func main() {
	loadConfig()

	fmt.Println(config)

	r := gin.Default()

	r.GET("/api/backups/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.GET("/api/backups", createAndGetBackup)

	r.Run()
}

func loadConfig() {
	configFile, err := os.Open("backups.json")
	if err != nil {
		panic("error opening config: " + err.Error())
	}

	defer configFile.Close()

	jsonParser := json.NewDecoder(configFile)

	if err = jsonParser.Decode(&config); err != nil {
		panic("error parsing config: " + err.Error())
	}
}

func createAndGetBackup(c *gin.Context) {

	archFile, err := os.CreateTemp("", "*.zip")
	if err != nil {
		log.Error("Failed!!", err.Error())
		c.Status(http.StatusInternalServerError)
		return
	}
	defer archFile.Close()

	zipWriter := zip.NewWriter(archFile)
	defer zipWriter.Close()

	for _, path := range config.Paths {
		log.Infof("Working on %s", path)
		if err := zipFolder(path, zipWriter); err != nil {
			log.Error(err.Error())
			c.Status(http.StatusInternalServerError)
			return
		}
	}

	zipWriter.Close()
	archFile.Close()

	file, err := os.Open(archFile.Name())
	if err != nil {
		log.Error(err.Error())
		c.Status(http.StatusInternalServerError)
		return
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		log.Error(err.Error())
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Header("Content-Disposition", "attachment; filename=backup.zip")
	c.DataFromReader(http.StatusOK, fileInfo.Size(), "application/zip", file, nil)
}

func zipFolder(source string, zipWriter *zip.Writer) error {
	baseFolder := filepath.Base(source)

	return filepath.Walk(source, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if path == source {
			return nil
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = filepath.Join(baseFolder, strings.TrimPrefix(path, source))

		if info.IsDir() {
			header.Name += "/"
			_, err = zipWriter.CreateHeader(header)
			return err
		}

		stat, err := os.Lstat(path)
		if err != nil {
			return err
		}
		if stat.Mode()&os.ModeSymlink != 0 {
			log.Infof("found symlink %s ; skip", path)
			return nil
		}

		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		_, err = io.Copy(writer, file)
		return err
	})
}
