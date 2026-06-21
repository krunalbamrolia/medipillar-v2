import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Company } from "../types";

export async function getCompanyByIdApi(id: string): Promise<Company> {
  return client.get<Company>(ENDPOINTS.companies.detail(id));
}
