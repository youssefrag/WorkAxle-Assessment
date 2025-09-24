# ---------- builder (for prod image) ----------
FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git build-base protobuf
ENV PATH="/go/bin:${PATH}"

# protoc plugins
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.1 \
 && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.4.0

# Prime module cache
COPY services/policy-go/go.mod ./go.mod
RUN go mod download

# Source + proto
COPY services/policy-go/ ./
COPY proto ./proto

# Generate stubs -> /app/gen
RUN mkdir -p gen \
 && protoc -I proto \
    --go_out=paths=source_relative:gen \
    --go-grpc_out=paths=source_relative:gen \
    proto/policy.proto

# Ensure go.sum is complete, then build
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/policy ./cmd/server

FROM golang:1.23-alpine AS dev
WORKDIR /workspace/services/policy-go
RUN apk add --no-cache git build-base protobuf
# (optional) keep PATH, but we also use absolute paths
ENV PATH="/usr/local/go/bin:/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
RUN /usr/local/go/bin/go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.1 \
 && /usr/local/go/bin/go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.4.0 \
 && /usr/local/go/bin/go install github.com/cosmtrek/air@v1.51.0
EXPOSE 50051
CMD ["sh","-lc","/usr/local/go/bin/go mod download && /go/bin/air -c .air.toml"]

# ---------- runtime (small prod image) ----------
FROM alpine:3.20 AS runtime
WORKDIR /app
ENV GRPC_PORT=50051
COPY --from=builder /bin/policy /usr/local/bin/policy
COPY --from=builder /app/migrations ./migrations
EXPOSE 50051
CMD ["/usr/local/bin/policy"]
