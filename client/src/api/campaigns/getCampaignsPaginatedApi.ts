import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Campaign, PaginatedResult } from "../types";

export interface GetCampaignsPaginatedParams {
  search?: string;
  status?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function getCampaignsPaginatedApi(params: GetCampaignsPaginatedParams = {}): Promise<PaginatedResult<Campaign>> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  return client.get<PaginatedResult<Campaign>>(`${ENDPOINTS.admin.campaigns}?${queryParams.toString()}`);
}
