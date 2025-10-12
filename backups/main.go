package main

import (
	"archive/zip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/moby/moby/api/pkg/stdcopy"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/client"
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

	dumpPath, err := createDatabaseDump()
	if err != nil {
		log.Error(err.Error())
		c.Status(http.StatusInternalServerError)
		return
	}

	err = addFileToZip(zipWriter, dumpPath)
	if err != nil {
		log.Error(err.Error())
		c.Status(http.StatusInternalServerError)
		return
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

func addFileToZip(zipWriter *zip.Writer, fileName string) error {
	fileToZip, err := os.Open(fileName)
	if err != nil {
		return err
	}
	defer fileToZip.Close()

	info, err := fileToZip.Stat()
	if err != nil {
		return err
	}

	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}
	header.Name = filepath.Base(fileName)
	header.Method = zip.Deflate

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}
	_, err = io.Copy(writer, fileToZip)
	return err
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

func createDatabaseDump() (string, error) {
	apiClient, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return "", err
	}

	// res, err := apiClient.ContainerList(context.Background(), client.ContainerListOptions{All: true})
	// fmt.Println(res)
	// return "", nil

	cmd := []string{"pg_dump", "-U", "postgres"}
	opts := container.ExecOptions{
		User:         "postgres",
		Cmd:          cmd,
		AttachStdout: true, // We need to attach stdout to get pg_dump output
		// AttachStderr: true,
	}
	ctx := context.Background()

	resp, err := apiClient.ContainerExecCreate(ctx, "back_devcontainer-db-1", opts)
	if err != nil {
		return "", err
	}

	attachResp, err := apiClient.ContainerExecAttach(ctx, resp.ID, container.ExecAttachOptions{})
	if err != nil {
		return "", err
	}
	defer attachResp.Close()
	file, err := os.CreateTemp("", "pgdump_*.sql")
	if err != nil { //nolint:errcheck
		return "", err
	}
	defer file.Close()

	_, err = stdcopy.StdCopy(file, io.Discard, attachResp.Reader)
	if err != nil {
		return "", err
	}

	inspectResp, err := apiClient.ContainerExecInspect(ctx, resp.ID)
	if err != nil {
		return "", err
	}
	log.Infof("Exit code: %d", inspectResp.ExitCode)

	file.Close()

	return file.Name(), nil
}
