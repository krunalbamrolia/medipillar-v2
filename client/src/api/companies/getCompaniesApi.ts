import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Company } from "../types";

export async function getCompaniesApi(): Promise<Company[]> {
  return client.get<Company[]>(ENDPOINTS.companies.base);
}
