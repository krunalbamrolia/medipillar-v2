import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category } from "../types";

export async function getCategoryByIdApi(id: string): Promise<Category & { order: number }> {
  return client.get<Category & { order: number }>(ENDPOINTS.categories.detail(id));
}
