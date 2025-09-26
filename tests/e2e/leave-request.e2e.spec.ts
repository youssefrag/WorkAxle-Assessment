import { api, login } from "./helpers";
import { resetPolicyDb } from "./reset";

// Data Seed ran before can be found in services/leave-api/prisma/seed.js

describe("Leave request flow", () => {
  let employeeToken: string;
  let managerToken: string;

  beforeAll(async () => {
    employeeToken = await login("bob.dev@example.com");
    managerToken = await login("alice.manager@example.com");
  });

  beforeEach(() => {
    resetPolicyDb();
  });

  it("employee creates request -> pending, manager approves -> approved", async () => {
    // 1) Employee creates a request
    const create = await api()
      .post("/leave-request")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ startDate: "2025-01-01", endDate: "2025-01-03" });

    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty("id");
    expect(create.body.status).toBe("PENDING_MANAGER");

    const id = create.body.id;

    // 2) Manager approves
    const approve = await api()
      .patch(`/leave-request/${id}/approve`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send();

    expect(approve.status).toBe(200);
    expect(approve.body).toHaveProperty("id", id);
    expect(approve.body.status).toBe("APPROVED");
  });

  it("second request of 11 days exceeds 20 and is rejected by policy on creation", async () => {
    // 1) First request: 10 days (approved)
    const first = await api()
      .post("/leave-request")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ startDate: "2025-01-01", endDate: "2025-01-10" }); // 10 days inclusive

    expect(first.status).toBe(201);
    expect(first.body.status).toBe("PENDING_MANAGER");

    const firstId = first.body.id;

    const approveFirst = await api()
      .patch(`/leave-request/${firstId}/approve`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send();

    expect(approveFirst.status).toBe(200);
    expect(approveFirst.body.status).toBe("APPROVED");

    // 2) Second request: 11 days (should exceed 20 total and be rejected immediately)
    const second = await api()
      .post("/leave-request")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({ startDate: "2025-01-11", endDate: "2025-01-21" }); // 11 days inclusive

    // The service persists the row but marks it rejected by policy
    expect([200, 201]).toContain(second.status);
    expect(second.body).toHaveProperty("id");
    expect(second.body.status).toBe("REJECTED_POLICY");
  });

  it("overlap: user1 approved, user2 overlapping request is rejected by policy", async () => {
    // Log in both employees (same team) + manager
    const emp1 = await login("bob.dev@example.com"); // user 1 (Platform)
    const emp2 = await login("carol.qa@example.com"); // user 2 (Platform)
    const mgr = await login("alice.manager@example.com");

    // 1) User 1 creates a request
    const first = await api()
      .post("/leave-request")
      .set("Authorization", `Bearer ${emp1}`)
      .send({ startDate: "2025-02-01", endDate: "2025-02-05" }); // 5 days

    expect(first.status).toBe(201);
    expect(first.body.status).toBe("PENDING_MANAGER");
    const firstId = first.body.id;

    // Manager approves user 1
    const approveFirst = await api()
      .patch(`/leave-request/${firstId}/approve`)
      .set("Authorization", `Bearer ${mgr}`)
      .send();

    expect(approveFirst.status).toBe(200);
    expect(approveFirst.body.status).toBe("APPROVED");

    // 2) User 2 requests an OVERLAPPING range (overlaps 02/03–02/05)
    const second = await api()
      .post("/leave-request")
      .set("Authorization", `Bearer ${emp2}`)
      .send({ startDate: "2025-02-03", endDate: "2025-02-07" }); // overlaps with user1 approval

    // Policy ValidateLeave should reject at creation due to team overlap
    expect([200, 201]).toContain(second.status);
    expect(second.body).toHaveProperty("id");
    expect(second.body.status).toBe("REJECTED_POLICY");
  });
});
