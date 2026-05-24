/** Database row types (Supabase / PostgreSQL) */

export interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItemDetail {
  id: string;
  medicineName: string;
  medicineSubName: string;
  companyName: string;
  quantity: number;
  tracked: boolean;
}

export interface AdminUserOrderDetail extends Order {
  totalAmount: string;
  items: OrderItemDetail[];
  itemCount: number;
}

export interface ProfileWithOrders extends Profile {
  orderCount: number;
  recentOrders: AdminUserOrderDetail[];
}

export interface AdminUserOrdersPage extends PaginatedResult<AdminUserOrderDetail> {
  user: Profile;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  subName: string;
  description: string;
  companyId: string;
  categoryId: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  medicineId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  address: string;
  createdAt: string;
}

export interface AdminOrder extends Order {
  totalAmount: string;
  user?: Profile;
}

export interface OrderItem {
  id: string;
  orderId: string;
  medicineId: string;
  quantity: number;
}

export interface Query {
  id: string;
  userId: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
