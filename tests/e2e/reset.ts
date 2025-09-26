import { execSync } from "node:child_process";

export function resetPolicyDb() {
  const base =
    "docker compose -f docker/docker-compose.yml -f docker/docker-compose.test.yml exec -T postgres";
  execSync(
    `${base} psql -U wa -d policy_db_test -c "TRUNCATE TABLE approved_team_leaves RESTART IDENTITY;"`,
    { stdio: "inherit" }
  );
  execSync(
    `${base} psql -U wa -d policy_db_test -c "UPDATE employee_balances SET used_days = 0;"`,
    { stdio: "inherit" }
  );
}
