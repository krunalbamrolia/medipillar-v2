import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function checkPhoneApi(phone: string): Promise<{ exists: boolean; needsSetup: boolean }> {
  return client.post<{ exists: boolean; needsSetup: boolean }>(ENDPOINTS.auth.checkPhone, { phone });
}
