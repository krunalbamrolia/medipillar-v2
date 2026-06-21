import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export async function removeCartItemApi(id: string): Promise<void> {
  return client.delete<void>(ENDPOINTS.cart.detail(id));
}
