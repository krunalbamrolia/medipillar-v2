import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Category } from "../types";

export interface CreateCategoryParams {
  name: string;
  order?: number;
}

export async function createCategoryApi(params: CreateCategoryParams): Promise<Category & { order: number }> {
  return client.post<Category & { order: number }>(ENDPOINTS.categories.base, params);
}
