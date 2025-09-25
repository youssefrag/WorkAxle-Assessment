package grpcsrv

import (
	"context"

	"log"
	"time"

	policypb "workaxle/policy/gen"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// Ensure we implement the interface
var _ policypb.PolicyServiceServer = (*Server)(nil)

type Server struct {
	policypb.UnimplementedPolicyServiceServer
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Server { return &Server{db: db} }

func (s *Server) ValidateLeave(ctx context.Context, req *policypb.ValidateLeaveRequest) (*policypb.ValidateLeaveResponse, error) {

	log.Printf("[Policy] ValidateLeave called: emp=%d team=%d start=%s end=%s year=%d",
		req.EmployeeId, req.TeamId, req.StartDate, req.EndDate, req.Year,
	)

	// Parse start and end into time.Time

	const layout = "2006-01-02"
	start, err := time.Parse(layout, req.StartDate)

	if err != nil {
		return &policypb.ValidateLeaveResponse{Ok: false}, nil
	}

	end, err := time.Parse(layout, req.EndDate)

	if err != nil {
		return &policypb.ValidateLeaveResponse{Ok: false}, nil
	}

	// Make sure start <= end
	if end.Before(start) {
		return &policypb.ValidateLeaveResponse{Ok: false}, nil
	}

	// Start and end have to be in the same year
	if start.Year() != end.Year() {
		return &policypb.ValidateLeaveResponse{Ok: false}, nil
	}

	// Check if employee has enough days for a given year

	requested := int(end.Sub(start).Hours()/24) + 1

	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})

	if err != nil {
		return nil, status.Errorf(codes.Internal, "begin tx: %v", err)
	}
	defer func() { _ = tx.Rollback(ctx)} ()

	// If no row exists for employee/year in employee_balances table, create row with 20 days yearly vacation days

	_, err = tx.Exec(ctx, `
		INSERT INTO employee_balances (employee_id, year, allocated_days)
		VALUES ($1, $2, 20)
		ON CONFLICT (employee_id, year) DO NOTHING
	`, req.EmployeeId, req.Year)

	if err != nil {
    return nil, status.Errorf(codes.Internal, "ensure balance row: %v", err)
	}

	// Read remaining days

	var remaining int
	err = tx.QueryRow(ctx,`
		SELECT allocated_days - used_days AS remaining
		FROM employee_balances
		WHERE employee_id = $1 AND year = $2
	`, req.EmployeeId, req.Year).Scan(&remaining)

	if err != nil {
		return nil, status.Errorf(codes.Internal, "read balance row: %v", err)
	}

	// Compare remaining and requested

	if requested > remaining {
		_ = tx.Rollback(ctx)
		return &policypb.ValidateLeaveResponse{Ok: false}, nil
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, status.Errorf(codes.Internal, "commit: %v", err)
	}

	// Check for vacation overlap in the same team

	var count int
	err = s.db.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM approved_team_leaves
		WHERE team_id = $1
			AND NOT (end_date < $2 OR start_date > $3)
	`, req.TeamId, req.StartDate, req.EndDate).Scan(&count)

	if err != nil {
		return nil, status.Errorf(codes.Internal, "overlap check failed: %v", err)
	}

	if count > 0 {
		return &policypb.ValidateLeaveResponse{Ok: false}, nil // overlap
	}
	return &policypb.ValidateLeaveResponse{Ok: true}, nil     // no overlap
}

func (s *Server) RecordApproval(ctx context.Context, req *policypb.RecordApprovalRequest) (*policypb.RecordApprovalResponse, error) {
	return &policypb.RecordApprovalResponse{}, nil
}
