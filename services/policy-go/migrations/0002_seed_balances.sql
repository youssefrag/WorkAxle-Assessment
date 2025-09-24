INSERT INTO employee_balances (employee_id, year, allocated_days, used_days)
VALUES (2, 2025, 15, 0)
ON CONFLICT (employee_id, year) DO NOTHING;