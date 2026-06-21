import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function forgotPasswordApi(phoneOrEmail: string): Promise<{ success: boolean; phone?: string }> {
  const isEmail = phoneOrEmail.includes("@");
  const body = isEmail ? { email: phoneOrEmail } : { phone: phoneOrEmail };
  return client.post<{ success: boolean; phone?: string }>(ENDPOINTS.auth.forgotPassword, body);
}
