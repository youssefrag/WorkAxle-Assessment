import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: __dirname,
  testMatch: ["**/*.e2e.spec.ts"],
  verbose: true,
  testTimeout: 30000,
};
export default config;
