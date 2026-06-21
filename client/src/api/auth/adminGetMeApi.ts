import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function adminGetMeApi(): Promise<{ authenticated: boolean }> {
  try {
    return await client.get<{ authenticated: boolean }>(ENDPOINTS.admin.me);
  } catch (error) {
    return { authenticated: false };
  }
}
