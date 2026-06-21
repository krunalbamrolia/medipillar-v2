import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function checkEmailApi(email: string): Promise<{ exists: boolean }> {
  return client.post<{ exists: boolean }>(ENDPOINTS.auth.checkEmail, { email });
}
