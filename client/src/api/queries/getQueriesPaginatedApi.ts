import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Query, PaginatedResult } from "../types";

export interface GetQueriesPaginatedParams {
  search?: string;
  page?: number;
  limit?: number;
  resolved?: boolean;
}

export async function getQueriesPaginatedApi(params: GetQueriesPaginatedParams = {}): Promise<PaginatedResult<Query>> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.resolved !== undefined) queryParams.append("resolved", String(params.resolved));

  return client.get<PaginatedResult<Query>>(`${ENDPOINTS.admin.queries}?${queryParams.toString()}`);
}
