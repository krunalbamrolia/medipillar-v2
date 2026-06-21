import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function deleteCategoryApi(id: string): Promise<void> {
  return client.delete<void>(ENDPOINTS.categories.detail(id));
}
