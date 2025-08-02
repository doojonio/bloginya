# --- Builder Stage ---
# This stage installs poetry and dependencies
FROM python:3.13-slim as builder

WORKDIR /app

# Install poetry
RUN pip install poetry

# Copy dependency definitions
COPY pyproject.toml poetry.lock* ./

# Install dependencies, without creating a virtualenv in the image
# --no-root is to avoid installing the project itself, only its dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --no-root

# Copy the application code
COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
