import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Company } from "../types";

export interface CreateCompanyParams {
  name: string;
  description?: string | null;
  photo?: string | null;
}

export async function createCompanyApi(params: CreateCompanyParams): Promise<Company> {
  return client.post<Company>(ENDPOINTS.companies.base, params);
}
