import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Company, Medicine } from "../types";

export interface SearchAllResponse {
  companies: Company[];
  medicines: Medicine[];
}

export async function searchAllApi(query: string): Promise<SearchAllResponse> {
  return client.get<SearchAllResponse>(`${ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
}
