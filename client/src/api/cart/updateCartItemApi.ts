import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CartItem } from "../types";

export async function updateCartItemApi(id: string, quantity: number): Promise<CartItem> {
  return client.patch<CartItem>(ENDPOINTS.cart.detail(id), { quantity });
}
