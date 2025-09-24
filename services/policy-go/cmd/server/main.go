package main

import (
	"context"
	"log"
	"net"
	"os"

	policypb "workaxle/policy/gen"
	"workaxle/policy/internal/grpcsrv"

	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc"
)

func mustEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}


	return def
}

func main() {
	addr := ":" + mustEnv("GRPC_PORT", "50051")
	dbURL := mustEnv("DATABASE_URL", "postgres://wa:wa@postgres:5432/policy_db?sslmode=disable")

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer pool.Close()

	lis, err := net.Listen("tcp", addr) // NOTE: capital L
	if err != nil {
		log.Fatalf("listen: %v", err)
	}

	s := grpc.NewServer()
	policypb.RegisterPolicyServiceServer(s, grpcsrv.New(pool)) // NOTE: *Server

	log.Printf("policy-svc listening on %s", addr)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("serve: %v", err)
	}
}
