import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { Order } from "../types";

export interface CreateOrderParams {
  address: string;
}

export async function createOrderApi(params: CreateOrderParams): Promise<Order> {
  return client.post<Order>(ENDPOINTS.orders.base, params);
}
