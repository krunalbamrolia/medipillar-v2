import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Company, PaginatedResult } from "../types";

export interface GetCompaniesPaginatedParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getCompaniesPaginatedApi(params: GetCompaniesPaginatedParams = {}): Promise<PaginatedResult<Company>> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  return client.get<PaginatedResult<Company>>(`${ENDPOINTS.companies.paginated}?${queryParams.toString()}`);
}
