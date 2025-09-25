package grpcsrv

import (
	"context"

	"log"

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

	log.Printf("[Policy] ValidateLeave called: emp=%d team=%d start=%s end=%s year=%d",
		req.EmployeeId, req.TeamId, req.StartDate, req.EndDate, req.Year,
	)

	log.Println("VERY OBVIOUS LOG!!!!!!! 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴")

	return &policypb.ValidateLeaveResponse{Ok: false}, nil
}

func (s *Server) RecordApproval(ctx context.Context, req *policypb.RecordApprovalRequest) (*policypb.RecordApprovalResponse, error) {
	return &policypb.RecordApprovalResponse{}, nil
}
