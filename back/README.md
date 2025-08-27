# Bloginya Backend

This is the backend server for the Bloginya blogging platform. It is a Perl-based application built with the Mojolicious framework.

## Features

*   User authentication with Google OAuth
*   Post management (create, edit, publish drafts)
*   Category management
*   Commenting system
*   File uploads to a dedicated drive
*   Search functionality
*   User profiles and settings
*   Admin panel for user management
*   View statistics for posts

## Prerequisites

*   Perl 5.34+
*   Docker and Docker Compose

## Getting Started

Perl dependencies are managed by [Carmel](https://metacpan.org/pod/Carmel). The application can be run using Docker or locally.

**With Docker:**

The provided `Dockerfile` and `docker-compose.yml` in the `.devcontainer` directory can be used to run the application in a containerized environment.

```bash
docker-compose -f .devcontainer/docker-compose.yml up -d
```

The application will be available at `http://localhost:8080`.

**Locally:**

For production, use the `hypnotoad` server:

```bash
carmel exec hypnotoad -f script/bloginya
```

For development, it is recommended to use the `morbo` server, which will automatically reload the application on code changes:

```bash
carmel exec morbo script/bloginya
```

## API

The API provides endpoints for managing posts, categories, comments, users, and more. The main application logic can be found in `lib/Bloginya.pm`, which defines the API routes.

All API routes are prefixed with `/api`. Some routes require authentication.

## Database

The application uses PostgreSQL for its primary database. The database schema is managed with `pgmig.sql` in the `db` directory.

## Testing

To run the tests, execute the following command:

```bash
prove -l t
```
