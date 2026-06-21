import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { User } from "../types";

export interface SetupAccountParams {
  email: string;
  password: string;
}

export async function setupAccountApi(params: SetupAccountParams): Promise<{ success: boolean; user: User }> {
  return client.post<{ success: boolean; user: User }>(ENDPOINTS.auth.setupAccount, params);
}
