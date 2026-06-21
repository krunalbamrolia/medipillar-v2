import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { OrderItem } from "../types";

export async function updateOrderItemTrackedApi(
  itemId: string,
  tracked: boolean
): Promise<OrderItem> {
  return client.patch<OrderItem>(ENDPOINTS.admin.orderItemTracked(itemId), { tracked });
}
