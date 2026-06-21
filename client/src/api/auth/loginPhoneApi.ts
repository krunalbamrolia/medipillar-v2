import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { User } from "../types";

export interface LoginPhoneParams {
  phone: string;
  password: string;
}

export async function loginPhoneApi(params: LoginPhoneParams): Promise<{ success: boolean; user: User }> {
  return client.post<{ success: boolean; user: User }>(ENDPOINTS.auth.loginPhone, params);
}
