# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod tidy

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o cool_audio .

# Final stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/cool_audio .
COPY --from=builder /app/config.json .

EXPOSE 8080

CMD ["./cool_audio"]
