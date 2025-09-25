import { Observable } from "rxjs";

export interface ValidateLeaveRequest {
  employee_id: number;
  team_id: number;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  year: number;
}

export interface ValidateLeaveResponse {
  ok: boolean;
}

export interface RecordApprovalRequest {
  employee_id: number;
  team_id: number;
  start_date: string;
  end_date: string;
  year: number;
  days: number;
}

export interface RecordApprovalResponse { }

export interface PolicyServiceClient {
  ValidateLeave(req: ValidateLeaveRequest): Observable<ValidateLeaveResponse>;
  RecordApproval(req: RecordApprovalRequest): Observable<RecordApprovalResponse>;
}