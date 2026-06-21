import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function adminLogoutApi(): Promise<{ success: boolean }> {
  return client.post<{ success: boolean }>(ENDPOINTS.admin.logout);
}
