import { client } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AdminOrder } from "../types";

export async function updateOrderStatusApi(id: string, status: string): Promise<AdminOrder> {
  return client.patch<AdminOrder>(ENDPOINTS.admin.orderStatus(id), { status });
}
