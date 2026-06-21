export * from "@shared/types/database";
export * from "@shared/schema";
export type { Medicine, Company } from "@shared/types/catalog";
export type { CartItem, Category, Order, OrderItem } from "@shared/schema";

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  accountSetupComplete?: boolean;
  createdAt: string;
}
