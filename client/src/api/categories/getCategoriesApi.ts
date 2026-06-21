import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category } from "../types";

export async function getCategoriesApi(): Promise<Array<Category & { order: number }>> {
  return client.get<Array<Category & { order: number }>>(ENDPOINTS.categories.base);
}
