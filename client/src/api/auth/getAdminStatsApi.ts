import { client } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface DashboardStats {
  companies: number;
  medicines: number;
  users: number;
  orders: number;
  openQueries: number;
  statusData: { name: string; count: number }[];
  orderTrend: { date: string; orders: number }[];
  categoryData: { name: string; value: number }[];
}

export async function getAdminStatsApi(): Promise<DashboardStats> {
  return client.get<DashboardStats>(ENDPOINTS.admin.stats);
}
