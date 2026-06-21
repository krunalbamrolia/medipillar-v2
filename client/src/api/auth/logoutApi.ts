import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function logoutApi(): Promise<void> {
  return client.post<void>(ENDPOINTS.auth.logout);
}
