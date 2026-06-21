import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CartItem } from "../types";

export async function addCartItemApi(medicineId: string, quantity: number): Promise<CartItem> {
  return client.post<CartItem>(ENDPOINTS.cart.base, { medicineId, quantity });
}
