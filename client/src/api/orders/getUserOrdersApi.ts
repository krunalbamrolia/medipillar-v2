import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Order } from "../types";

export async function getUserOrdersApi(): Promise<Order[]> {
  return client.get<Order[]>(ENDPOINTS.orders.base);
}
