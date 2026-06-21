import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Profile } from "../types";

export async function updateUserStatusApi(id: string, isActive: boolean): Promise<Profile> {
  return client.patch<Profile>(ENDPOINTS.admin.userStatus(id), { isActive });
}
