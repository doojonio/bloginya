# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod tidy

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o backups .

# Final stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/backups .
COPY --from=builder /app/backups.json .

EXPOSE 8080

CMD ["./backups"]
