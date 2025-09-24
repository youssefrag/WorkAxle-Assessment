package grpcsrv

import (
	"context"

	policypb "workaxle/policy/gen"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Ensure we implement the interface
var _ policypb.PolicyServiceServer = (*Server)(nil)

type Server struct {
	policypb.UnimplementedPolicyServiceServer
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Server { return &Server{db: db} }

// TODO: add real checks (balances + overlap)
func (s *Server) ValidateLeave(ctx context.Context, req *policypb.ValidateLeaveRequest) (*policypb.ValidateLeaveResponse, error) {
	return &policypb.ValidateLeaveResponse{Ok: true}, nil
}

func (s *Server) RecordApproval(ctx context.Context, req *policypb.RecordApprovalRequest) (*policypb.RecordApprovalResponse, error) {
	return &policypb.RecordApprovalResponse{}, nil
}
