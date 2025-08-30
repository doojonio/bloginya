BINARY_NAME=cool_audio

.PHONY: build run test test-ci clean fmt lint deps

build:
	go build -o $(BINARY_NAME) .

run:
	go run .

test:
	go test -v ./...

test-ci:
	go test -v -cover ./...

clean:
	rm -f $(BINARY_NAME)

fmt:
	go fmt ./...
