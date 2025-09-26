import * as request from "supertest";

export const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export const api = () => request(baseURL);

export async function login(email: string) {
  const res = await api().post("/auth/login").send({ email });
  if (res.status >= 400) throw new Error("login failed: " + res.text);
  const token = res.body?.access_token;
  if (!token) throw new Error("no token in login response");
  return token as string;
}
