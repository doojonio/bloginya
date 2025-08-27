# Cool Audio Service

A simple Go service for uploading and streaming audio files.

## Features

*   Upload audio files.
*   Stream audio files.
*   Health check endpoint.
*   Configurable file size limits and media types.

## API Endpoints

### Upload Audio

*   **URL:** `/upload`
*   **Method:** `POST`
*   **Form Field:** `audio`
*   **Description:** Uploads an audio file. The file will be saved with a random filename.
*   **Responses:**
    *   `200 OK`: File uploaded successfully. The response body will contain the new filename.
    *   `400 Bad Request`: If the file is too large, too small, or no file is provided.
    *   `405 Method Not Allowed`: If the request method is not `POST`.
    *   `415 Unsupported Media Type`: If the file's media type is not allowed.
    *   `500 Internal Server Error`: If there was an error saving the file.

### Stream Audio

*   **URL:** `/stream/{filename}`
*   **Method:** `GET`
*   **Description:** Streams an audio file.
*   **Responses:**
    *   `200 OK`: The file is streamed in the response body.
    *   `404 Not Found`: If the file does not exist.

### Health Check

*   **URL:** `/health`
*   **Method:** `GET`
*   **Description:** Checks the health of the service.
*   **Responses:**
    *   `200 OK`: The service is healthy.

## Configuration

The service is configured using the `config.json` file.

```json
{
  "max_file_size": 10485760,
  "min_file_size": 1024,
  "allowed_media_types": [
    "audio/mpeg",
    "audio/wav"
  ],
  "upload_dir": "uploads"
}
```

*   `max_file_size`: Maximum allowed file size in bytes.
*   `min_file_size`: Minimum allowed file size in bytes.
*   `allowed_media_types`: A list of allowed MIME types.
*   `upload_dir`: The directory to store uploaded files.

## Getting Started

### Prerequisites

*   Go 1.18 or later
*   Docker (optional)

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url.com/cool_audio
    cd cool_audio
    ```

2.  **Create a `config.json` file:**
    Create a `config.json` file with your desired settings. See the [Configuration](#configuration) section for details.

3.  **Run the service:**
    ```bash
    go run .
    ```

The service will be running at `http://localhost:8080`.

### Running with Docker

1.  **Build the Docker image:**
    ```bash
    docker build -t cool_audio .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -p 8080:8080 cool_audio
    ```

The service will be running at `http://localhost:8080`.

## Usage

### Upload a file

```bash
curl -X POST -F "audio=@/path/to/your/audio.mp3" http://localhost:8080/upload
```

### Stream a file

```bash
curl http://localhost:8080/stream/your-randomly-generated-filename.mp3
```
