import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category } from "../types";

export interface UpdateCategoryParams {
  name?: string;
}

export async function updateCategoryApi(id: string, params: UpdateCategoryParams): Promise<Category & { order: number }> {
  return client.patch<Category & { order: number }>(ENDPOINTS.categories.detail(id), params);
}
