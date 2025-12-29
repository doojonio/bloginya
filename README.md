# Bloginya

Bloginya is a modern blogging platform built with a Perl backend (Mojolicious) and an Angular frontend.

## Features

*   **User Management:** User registration, blocking, login, and profile management.
*   **Content Creation:** Create, edit, and delete blog posts with a rich text editor.
*   **Audio Posts:** Add audio files to blog posts for enhanced multimedia content.
*   **Categorization:** Organize posts with categories.
*   **Private categories:** Ability to create private categories visible only to the owner.
*   **Comments:** Allow users to comment on posts.
*   **Voice Comments:** Record and attach voice messages to comments.
*   **File Uploads:** Upload and manage files.
*   **Search:** Full-text search for posts.
*   **Admin Panel:** Manage users, posts, and other site settings.

## Architecture

The project is composed of four main services:

*   **`backend`:** A Perl-based API built with the Mojolicious framework. It handles all the business logic and data persistence.
*   **`frontend`:** An Angular single-page application that provides the user interface.
*   **`cool_asia`:** A Python microservice that provides language conversion functionality.
*   **`cool_audio`:** A Go microservice that handles audio file uploads and streaming for audio posts and voice comments.

All services are designed to be run in Docker containers.

## Getting Started

To get the project running locally, you can use Docker Compose.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd bloginya
    ```
2.  Create a `bloginya.yml` file in the `back` directory by copying the `bloginya.yml.sample` file.
    ```bash
    cp back/bloginya.yml.sample back/bloginya.yml
    ```
3.  Update the `bloginya.yml` file with your Google OAuth credentials. See the "Google OAuth Configuration" section below for more details.
4.  Run the application using the provided `docker-compose.yml` file:
    ```bash
    docker-compose up -d
    ```
5.  The application will be available at `http://localhost:4200`.

### Google OAuth Configuration

To use Google OAuth for authentication, you need to create a project in the [Google Cloud Console](https://console.cloud.google.com/) and enable the "Google People API".

Once you have created a project, you can create an OAuth 2.0 client ID in the "Credentials" section. When creating the client ID, you will need to specify the authorized redirect URIs. For local development, you should add `http://localhost:8080/api/oauth/from_google`.

After creating the client ID, you will be given a client ID and client secret. You will also need your project ID, which can be found in the "Dashboard" section of the Google Cloud Console.

Update the `google_oauth` section in your `back/bloginya.yml` file with these values.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.
