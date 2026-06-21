import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function verifyResetSessionApi(accessToken: string): Promise<{ success: boolean }> {
  return client.post<{ success: boolean }>(ENDPOINTS.auth.verifyResetSession, { accessToken });
}
