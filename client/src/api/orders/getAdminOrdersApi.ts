import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AdminOrder, PaginatedResult } from "../types";

export interface GetAdminOrdersParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export async function getAdminOrdersApi(params: GetAdminOrdersParams): Promise<PaginatedResult<AdminOrder>> {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);

  return client.get<PaginatedResult<AdminOrder>>(`${ENDPOINTS.admin.orders}?${queryParams.toString()}`);
}
