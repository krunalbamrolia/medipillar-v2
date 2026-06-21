import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category, PaginatedResult } from "../types";

export interface GetCategoriesPaginatedParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCategoriesPaginatedApi(params: GetCategoriesPaginatedParams = {}): Promise<PaginatedResult<Category & { order: number }>> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  return client.get<PaginatedResult<Category & { order: number }>>(`${ENDPOINTS.categories.paginated}?${queryParams.toString()}`);
}
