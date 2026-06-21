import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { User } from "../types";

export interface LoginEmailParams {
  email: string;
  password: string;
}

export async function loginEmailApi(params: LoginEmailParams): Promise<{ success: boolean; user: User }> {
  return client.post<{ success: boolean; user: User }>(ENDPOINTS.auth.loginEmail, params);
}
