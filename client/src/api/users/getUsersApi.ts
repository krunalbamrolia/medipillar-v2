import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Profile, PaginatedResult } from "../types";

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getUsersApi(params: GetUsersParams = {}): Promise<PaginatedResult<Profile & { orderCount: number }>> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  return client.get<PaginatedResult<Profile & { orderCount: number }>>(`${ENDPOINTS.admin.users}?${queryParams.toString()}`);
}
