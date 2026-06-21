import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function deleteCompanyApi(id: string): Promise<void> {
  return client.delete<void>(ENDPOINTS.companies.detail(id));
}
