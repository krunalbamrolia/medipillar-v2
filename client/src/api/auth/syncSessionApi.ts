import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { User } from "../types";

export interface SyncSessionParams {
  accessToken: string;
  name: string;
  phone: string;
  email?: string;
}

export async function syncSessionApi(params: SyncSessionParams): Promise<{ success: boolean; user: User; needsSetup: boolean }> {
  return client.post<{ success: boolean; user: User; needsSetup: boolean }>(ENDPOINTS.auth.session, params);
}
