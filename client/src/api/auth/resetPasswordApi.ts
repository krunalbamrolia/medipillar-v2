import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function resetPasswordApi(password: string): Promise<{ success: boolean }> {
  return client.post<{ success: boolean }>(ENDPOINTS.auth.resetPassword, { password });
}
