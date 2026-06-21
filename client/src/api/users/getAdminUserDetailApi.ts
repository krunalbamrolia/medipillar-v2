import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ProfileWithOrders } from "../types";

export async function getAdminUserDetailApi(id: string): Promise<ProfileWithOrders> {
  return client.get<ProfileWithOrders>(ENDPOINTS.admin.userDetail(id));
}
