# Workforce Backend Application — Leave Management (Leave API + Policy Service)

## 1) Business Logic Overview

This project is a **workforce management backend** for employee **leave requests**, split into two services:

- **Leave API (NestJS):** where employees create leave requests and managers approve/reject them.
- **Policy Service (Go/gRPC):** enforces leave policies (annual allowance and team overlap rules).

### Core rules

- **Annual allowance:** each employee has **20 days** of paid leave per calendar year.
- **Team overlap:** **no two employees on the same team** can take leave **on overlapping dates**.
- **Flow:**
  1. Employee submits a request (`CREATED` → validated by policy → `PENDING_MANAGER` or `REJECTED_POLICY`).
  2. If `PENDING_MANAGER`, the **team’s manager** can approve it (`APPROVED`) or reject it (`REJECTED_MANAGER`).
  3. When approved, the Policy Service records the approval and increments the employee’s used days.

## 2) Tech Stack & Architecture

### Services

- **Leave API:** NestJS (TypeScript)

  - REST endpoints (JWT-protected)
  - Prisma ORM for **leave_db**
  - Talks to Policy Service via **gRPC**

- **Policy Service:** Go
  - gRPC server with two methods:
    - `ValidateLeave(ValidateLeaveRequest)`
    - `RecordApproval(RecordApprovalRequest)`
  - Uses `pgx` to access **policy_db**

### Communication

- **Protocol:** gRPC (NestJS client ↔ Go server)
- **Contract:** `proto/policy.proto`

### Authentication & Authorization

- **Authentication:** NestJS JWT (Bearer token)
- **Authorization:**
  - Only the **team manager** can approve a leave for their team.

### Databases

We use **two Postgres databases**:

1. **leave_db** (NestJS/Prisma-managed)

   - `Employee`
   - `Team`
   - `LeaveRequest` (with status transitions and indexes)

2. **policy_db** (Go migrations)
   - `employee_balances(employee_id, year, allocated_days, used_days)`
   - `approved_team_leaves(id, team_id, employee_id, start_date, end_date)`

### Policy Validation Flow

1. Ensure dates are valid and in the same year.
2. Ensure employee balance exists (20 days default).
3. Check that requested days ≤ remaining balance.
4. Check no overlapping approved leave in the same team.
5. Approve or reject accordingly.

## 3) End-to-End Tests (Jest + Supertest)

We use **Jest** + **Supertest** to hit the real HTTP API, with the Go Policy Service running over gRPC in the same Docker network. Tests run against **separate test databases** so dev data is never touched.

> Data seed (users/teams) is in:  
> `services/leave-api/prisma/seed.js`

### Test Flows

- **Happy Path:** Employee requests leave → status `PENDING_MANAGER` → manager approves → status `APPROVED`.
- **Exceed Allowance:** Employee already used 10 days → second request for 11 more → rejected by policy as `REJECTED_POLICY`.
- **Overlap Rule:** Employee1 approved → Employee2 requests overlapping dates on same team → rejected by policy.

The full test suite can be found in:  
`tests/e2e/leave-request.e2e.spec.ts`

### Notes

- **Runner:** Jest + Supertest.
- **Databases:** Separate `*_test` databases are used so dev data is never touched.
- **Reset:** `resetPolicyDb()` helper truncates policy tables between tests.
- **Proof:** Please see the below screenshot of the passing tests.
