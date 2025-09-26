CREATE TABLE IF NOT EXISTS employee_balances (
  employee_id     INT NOT NULL,
  year            INT NOT NULL,
  allocated_days  INT NOT NULL,
  used_days       INT NOT NULL DEFAULT 0,
  PRIMARY KEY (employee_id, year)
);

CREATE TABLE IF NOT EXISTS approved_team_leaves (
  id          BIGSERIAL PRIMARY KEY,
  team_id     INT NOT NULL,
  employee_id INT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_date_overlap
  ON approved_team_leaves (team_id, start_date, end_date);