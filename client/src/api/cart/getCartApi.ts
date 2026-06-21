import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CartItem } from "../types";

export async function getCartApi(): Promise<CartItem[]> {
  return client.get<CartItem[]>(ENDPOINTS.cart.base);
}
