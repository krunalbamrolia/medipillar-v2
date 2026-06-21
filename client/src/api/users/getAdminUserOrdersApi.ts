import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AdminUserOrdersPage } from "../types";

export interface GetAdminUserOrdersParams {
  page?: number;
  limit?: number;
  medicineName?: string;
}

export async function getAdminUserOrdersApi(id: string, params: GetAdminUserOrdersParams = {}): Promise<AdminUserOrdersPage> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.medicineName) queryParams.append("medicineName", params.medicineName);

  return client.get<AdminUserOrdersPage>(`${ENDPOINTS.admin.userOrders(id)}?${queryParams.toString()}`);
}
