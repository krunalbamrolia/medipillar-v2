import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { OrderItemDetail } from "../types";

export interface OrderDetailsResponse {
  id: string;
  items: OrderItemDetail[];
  address: string;
  createdAt: string;
  status: string;
  totalAmount: string;
}

export async function getOrderByIdApi(id: string): Promise<OrderDetailsResponse> {
  return client.get<OrderDetailsResponse>(ENDPOINTS.orders.detail(id));
}
