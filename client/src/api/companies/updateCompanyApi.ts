import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Company } from "../types";

export interface UpdateCompanyParams {
  name?: string;
  description?: string | null;
  photo?: string | null;
}

export async function updateCompanyApi(id: string, params: UpdateCompanyParams): Promise<Company> {
  return client.patch<Company>(ENDPOINTS.companies.detail(id), params);
}
