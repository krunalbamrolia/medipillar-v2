import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Medicine, PaginatedResult } from "../types";

export interface GetMedicinesPaginatedParams {
  companyId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
}

export async function getMedicinesPaginatedApi(params: GetMedicinesPaginatedParams = {}): Promise<PaginatedResult<Medicine & { companyName: string; categoryName: string }>> {
  const queryParams = new URLSearchParams();
  if (params.companyId) queryParams.append("companyId", params.companyId);
  if (params.categoryId) queryParams.append("categoryId", params.categoryId);
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.status) queryParams.append("status", params.status);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);

  return client.get<PaginatedResult<Medicine & { companyName: string; categoryName: string }>>(`${ENDPOINTS.medicines.paginated}?${queryParams.toString()}`);
}
