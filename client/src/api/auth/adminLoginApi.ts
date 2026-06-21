import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface AdminLoginParams {
  email?: string;
  username?: string;
  password?: string;
}

export async function adminLoginApi(params: AdminLoginParams): Promise<{ success: boolean; admin: { email: string } }> {
  return client.post<{ success: boolean; admin: { email: string } }>(ENDPOINTS.admin.login, params);
}
