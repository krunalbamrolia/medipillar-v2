import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { databaseSetupHint, isMissingTableError, verifyDatabaseTables } from "./db-health";
import { DuplicateError } from "./errors";
import type {
  Profile,
  Company,
  Category,
  Medicine,
  CartItem,
  Order,
  OrderItem,
  OrderItemDetail,
  Query,
  PaginatedResult,
} from "@shared/types/database";

export type {
  Profile as User,
  Company,
  Category,
  Medicine,
  CartItem,
  Order,
  OrderItem,
  Query,
};

/** Legacy API shape used by existing React pages */
export type LegacyCompany = Company & { photo: string; status: string };
export type LegacyMedicine = Medicine & {
  photo: string;
  subname: string;
  status: string;
  subcategoryId?: string | null;
};
export type LegacyMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    isActive: row.is_active !== false,
    accountSetupComplete: row.account_setup_complete === true,
    createdAt: row.created_at as string,
  };
}

function rowToCompany(row: Record<string, unknown>): LegacyCompany {
  const logoUrl = (row.logo_url as string) ?? "";
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    logoUrl,
    photo: logoUrl,
    status: "active",
    createdAt: row.created_at as string,
  };
}

function rowToCategory(row: Record<string, unknown>): Category & { order: number } {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    order: 0,
  };
}

function rowToMedicine(row: Record<string, unknown>): LegacyMedicine {
  return {
    id: row.id as string,
    name: row.name as string,
    subName: (row.sub_name as string) ?? "",
    subname: (row.sub_name as string) ?? "",
    description: (row.description as string) ?? "",
    companyId: row.company_id as string,
    categoryId: row.category_id as string,
    photo: "",
    status: "active",
    subcategoryId: null,
    createdAt: row.created_at as string,
  };
}

function rowToCartItem(row: Record<string, unknown>): CartItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    medicineId: row.medicine_id as string,
    quantity: row.quantity as number,
  };
}

function rowToOrder(row: Record<string, unknown>): Order & { totalAmount: string } {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    status: row.status as string,
    address: (row.address as string) ?? "",
    createdAt: row.created_at as string,
    totalAmount: "0",
  };
}

function rowToOrderItem(
  row: Record<string, unknown>,
): OrderItem & { price: string; tracked: boolean } {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    medicineId: row.medicine_id as string,
    quantity: row.quantity as number,
    price: "0",
    tracked: row.tracked === true,
  };
}

function rowToQuery(row: Record<string, unknown>): Query {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? null,
    message: row.message as string,
    resolved: row.resolved as boolean,
    createdAt: row.created_at as string,
  };
}

function queryToLegacyMessage(q: Query): LegacyMessage {
  return {
    id: q.id,
    name: q.name,
    email: q.email ?? q.phone,
    message: q.message,
    createdAt: q.createdAt,
  };
}

function companyInput(data: {
  name: string;
  description?: string;
  photo?: string;
  logo_url?: string;
}) {
  return {
    name: data.name,
    description: data.description ?? "",
    logo_url: data.logo_url ?? data.photo ?? "",
  };
}

function medicineInput(data: {
  name: string;
  subname?: string;
  sub_name?: string;
  description?: string;
  companyId: string;
  categoryId: string;
}) {
  return {
    name: data.name,
    sub_name: data.sub_name ?? data.subname ?? "",
    description: data.description ?? "",
    company_id: data.companyId,
    category_id: data.categoryId,
  };
}

class SupabaseStorage {
  private db() {
    return getSupabaseAdmin();
  }

  private handleError(error: { code?: string; message?: string } | null): void {
    if (!error) return;
    if (isMissingTableError(error)) {
      throw new Error(databaseSetupHint());
    }
    throw error;
  }

  async connectDatabase(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
      return false;
    }
    const { ok } = await verifyDatabaseTables();
    return ok;
  }

  async initializeDatabase(): Promise<void> {
    // Schema applied via supabase/migrations — no seed required here
  }

  // ——— Profiles ———
  async upsertProfile(profile: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
  }): Promise<Profile> {
    const { data, error } = await this.db()
      .from("profiles")
      .upsert(
        {
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          email: profile.email ?? null,
        },
        { onConflict: "id" },
      )
      .select()
      .single();
    this.handleError(error);
    return rowToProfile(data);
  }

  async getUser(id: string): Promise<Profile | undefined> {
    const { data, error } = await this.db()
      .from("profiles")
      .select("id, name, phone, email, is_active, account_setup_complete, created_at")
      .eq("id", id)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToProfile(data) : undefined;
  }

  async getUserByPhone(phone: string): Promise<Profile | undefined> {
    const { data, error } = await this.db()
      .from("profiles")
      .select("id, name, phone, email, is_active, account_setup_complete, created_at")
      .eq("phone", phone)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToProfile(data) : undefined;
  }

  async getUserByEmail(email: string): Promise<Profile | undefined> {
    const { data, error } = await this.db()
      .from("profiles")
      .select("id, name, phone, email, is_active, account_setup_complete, created_at")
      .eq("email", email)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToProfile(data) : undefined;
  }

  async getUserByPhoneWithHash(phone: string): Promise<
    | (Profile & {
        passwordHash: string | null;
        accountSetupComplete: boolean;
      })
    | undefined
  > {
    const { data, error } = await this.db()
      .from("profiles")
      .select(
        "id, name, phone, email, is_active, created_at, password_hash, account_setup_complete",
      )
      .eq("phone", phone)
      .maybeSingle();
    this.handleError(error);
    if (!data) return undefined;
    return {
      ...rowToProfile(data),
      passwordHash: (data.password_hash as string) ?? null,
      accountSetupComplete: data.account_setup_complete === true,
    };
  }

  async getUserByEmailWithHash(email: string): Promise<
    | (Profile & {
        passwordHash: string | null;
        accountSetupComplete: boolean;
      })
    | undefined
  > {
    const { data, error } = await this.db()
      .from("profiles")
      .select(
        "id, name, phone, email, is_active, created_at, password_hash, account_setup_complete",
      )
      .eq("email", email)
      .maybeSingle();
    this.handleError(error);
    if (!data) return undefined;
    return {
      ...rowToProfile(data),
      passwordHash: (data.password_hash as string) ?? null,
      accountSetupComplete: data.account_setup_complete === true,
    };
  }

  async setPassword(userId: string, passwordHash: string): Promise<void> {
    const { error } = await this.db()
      .from("profiles")
      .update({ password_hash: passwordHash })
      .eq("id", userId);
    this.handleError(error);
  }

  async markAccountSetupComplete(userId: string): Promise<void> {
    const { error } = await this.db()
      .from("profiles")
      .update({ account_setup_complete: true })
      .eq("id", userId);
    this.handleError(error);
  }

  async updateUserEmail(userId: string, email: string): Promise<void> {
    const { error } = await this.db()
      .from("profiles")
      .update({ email })
      .eq("id", userId);
    this.handleError(error);
  }

  async getUsersPaginated(
    params: { search?: string; page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<Profile & { orderCount: number }>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = this.db().from("profiles").select("id, name, phone, email, is_active, account_setup_complete, created_at", { count: "exact" });
    if (params.search) {
      q = q.or(
        `name.ilike.%${params.search}%,phone.ilike.%${params.search}%,email.ilike.%${params.search}%`,
      );
    }
    const { data, error, count } = await q
      .order("created_at", { ascending: false })
      .range(from, to);
    this.handleError(error);
    const profiles = (data ?? []).map(rowToProfile);
    const userIds = profiles.map((p) => p.id);

    const orderCountByUser: Record<string, number> = {};
    if (userIds.length > 0) {
      const { data: orderRows, error: ordersError } = await this.db()
        .from("orders")
        .select("user_id")
        .in("user_id", userIds);
      this.handleError(ordersError);
      for (const row of orderRows ?? []) {
        const uid = row.user_id as string;
        orderCountByUser[uid] = (orderCountByUser[uid] ?? 0) + 1;
      }
    }

    const total = count ?? 0;
    return {
      data: profiles.map((p) => ({
        ...p,
        orderCount: orderCountByUser[p.id] ?? 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private async enrichOrderItems(
    items: (OrderItem & { tracked: boolean })[],
  ): Promise<OrderItemDetail[]> {
    if (!items.length) return [];

    const medicineIds = Array.from(new Set(items.map((it) => it.medicineId)));
    const medicineMap = new Map<
      string,
      { name: string; subName: string; companyId: string }
    >();
    const companyMap = new Map<string, string>();

    const { data: meds, error: medError } = await this.db()
      .from("medicines")
      .select("id, name, sub_name, company_id")
      .in("id", medicineIds);
    this.handleError(medError);

    const companyIds = Array.from(
      new Set((meds ?? []).map((m) => m.company_id as string)),
    );
    if (companyIds.length > 0) {
      const { data: companies, error: compError } = await this.db()
        .from("companies")
        .select("id, name")
        .in("id", companyIds);
      this.handleError(compError);
      for (const c of companies ?? []) {
        companyMap.set(c.id as string, c.name as string);
      }
    }
    for (const m of meds ?? []) {
      medicineMap.set(m.id as string, {
        name: m.name as string,
        subName: (m.sub_name as string) ?? "",
        companyId: m.company_id as string,
      });
    }

    return items.map((it) => {
      const med = medicineMap.get(it.medicineId);
      return {
        id: it.id,
        medicineName: med?.name ?? "Unknown product",
        medicineSubName: med?.subName ?? "",
        companyName: med ? (companyMap.get(med.companyId) ?? "—") : "—",
        quantity: it.quantity,
        tracked: it.tracked,
      };
    });
  }

  async getOrderItemsWithDetails(orderId: string): Promise<OrderItemDetail[]> {
    const items = await this.getOrderItems(orderId);
    return this.enrichOrderItems(items);
  }

  async updateOrderItemTracked(itemId: string, tracked: boolean): Promise<OrderItemDetail | undefined> {
    const { data, error } = await this.db()
      .from("order_items")
      .update({ tracked })
      .eq("id", itemId)
      .select()
      .maybeSingle();
    this.handleError(error);
    if (!data) return undefined;
    const [enriched] = await this.enrichOrderItems([rowToOrderItem(data)]);
    return enriched;
  }

  async getUserOrdersWithDetails(userId: string) {
    const orders = await this.getUserOrders(userId);
    const detailed: {
      id: string;
      userId: string;
      status: string;
      address: string;
      createdAt: string;
      totalAmount: string;
      items: OrderItemDetail[];
      itemCount: number;
    }[] = [];

    for (const order of orders) {
      const items = await this.getOrderItemsWithDetails(order.id);
      detailed.push({
        id: order.id,
        userId: order.userId,
        status: order.status,
        address: order.address,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        itemCount: items.length,
        items,
      });
    }

    return detailed;
  }

  async getAdminUserDetail(id: string) {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const allOrders = await this.getUserOrdersWithDetails(id);
    return {
      ...user,
      orderCount: allOrders.length,
      recentOrders: allOrders.slice(0, 2),
    };
  }

  async getAdminUserOrdersPaginated(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      medicineName?: string;
      quantity?: number;
    } = {},
  ) {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    let orders = await this.getUserOrdersWithDetails(userId);

    if (params.medicineName?.trim()) {
      const term = params.medicineName.trim().toLowerCase();
      orders = orders.filter((o) =>
        o.items.some(
          (i) =>
            i.medicineName.toLowerCase().includes(term) ||
            i.medicineSubName.toLowerCase().includes(term) ||
            i.companyName.toLowerCase().includes(term),
        ),
      );
    }

    if (params.quantity !== undefined && !Number.isNaN(params.quantity)) {
      orders = orders.filter((o) => o.items.some((i) => i.quantity === params.quantity));
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const total = orders.length;
    const from = (page - 1) * limit;

    return {
      user,
      data: orders.slice(from, from + limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const { data, error } = await this.db()
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);
    return data ? rowToProfile(data) : undefined;
  }

  // ——— Categories ———
  async getAllCategories(): Promise<(Category & { order: number })[]> {
    const { data, error } = await this.db()
      .from("categories")
      .select("id, name, created_at")
      .order("name");
    this.handleError(error);
    return (data ?? []).map(rowToCategory);
  }

  async getCategory(id: string) {
    const { data, error } = await this.db()
      .from("categories")
      .select("id, name, created_at")
      .eq("id", id)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToCategory(data) : undefined;
  }

  async getCategoriesPaginated(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<Category & { order: number }>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = this.db().from("categories").select("id, name, created_at", { count: "exact" });
    if (params.search) {
      q = q.ilike("name", `%${params.search}%`);
    }
    const { data, error, count } = await q.order("created_at", { ascending: false }).range(from, to);
    this.handleError(error);
    const total = count ?? 0;
    return {
      data: (data ?? []).map(rowToCategory),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private async categoryNameExists(name: string, excludeId?: string): Promise<boolean> {
    const { data, error } = await this.db()
      .from("categories")
      .select("id, name")
      .ilike("name", name.trim());
    this.handleError(error);
    return (data ?? []).some(
      (row) =>
        (row.name as string).trim().toLowerCase() === name.trim().toLowerCase() &&
        row.id !== excludeId,
    );
  }

  async createCategory(category: { name: string }) {
    if (await this.categoryNameExists(category.name)) {
      throw new DuplicateError("Category");
    }
    const { data, error } = await this.db()
      .from("categories")
      .insert({ name: category.name.trim() })
      .select()
      .single();
    this.handleError(error);
    return rowToCategory(data);
  }

  async updateCategory(id: string, category: Partial<{ name: string }>) {
    if (category.name && (await this.categoryNameExists(category.name, id))) {
      throw new DuplicateError("Category");
    }
    const patch = category.name ? { name: category.name.trim() } : category;
    const { data, error } = await this.db()
      .from("categories")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);
    return data ? rowToCategory(data) : undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error, count } = await this.db()
      .from("categories")
      .delete({ count: "exact" })
      .eq("id", id);
    this.handleError(error);
    return (count ?? 0) > 0;
  }

  // ——— Companies ———
  async getAllCompanies(): Promise<LegacyCompany[]> {
    const { data, error } = await this.db().from("companies").select("id, name, description, logo_url, created_at").order("name");
    this.handleError(error);
    return (data ?? []).map(rowToCompany);
  }

  async getCompany(id: string) {
    const { data, error } = await this.db()
      .from("companies")
      .select("id, name, description, logo_url, created_at")
      .eq("id", id)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToCompany(data) : undefined;
  }

  private async companyNameExists(name: string, excludeId?: string): Promise<boolean> {
    const { data, error } = await this.db()
      .from("companies")
      .select("id, name")
      .ilike("name", name.trim());
    this.handleError(error);
    return (data ?? []).some(
      (row) =>
        (row.name as string).trim().toLowerCase() === name.trim().toLowerCase() &&
        row.id !== excludeId,
    );
  }

  async createCompany(company: {
    name: string;
    description?: string | null;
    photo?: string | null;
  }) {
    if (await this.companyNameExists(company.name)) {
      throw new DuplicateError("Company");
    }
    const { data, error } = await this.db()
      .from("companies")
      .insert(
        companyInput({
          name: company.name.trim(),
          description: company.description ?? undefined,
          photo: company.photo ?? undefined,
        }),
      )
      .select()
      .single();
    this.handleError(error);
    return rowToCompany(data);
  }

  async updateCompany(
    id: string,
    company: Partial<{ name: string; description?: string | null; photo?: string | null }>,
  ) {
    if (company.name && (await this.companyNameExists(company.name, id))) {
      throw new DuplicateError("Company");
    }
    const patch: Record<string, string> = {};
    if (company.name) patch.name = company.name.trim();
    if (company.description !== undefined) patch.description = company.description ?? "";
    if (company.photo !== undefined) patch.logo_url = company.photo ?? "";
    const { data, error } = await this.db()
      .from("companies")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);
    return data ? rowToCompany(data) : undefined;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const { error, count } = await this.db()
      .from("companies")
      .delete({ count: "exact" })
      .eq("id", id);
    this.handleError(error);
    return (count ?? 0) > 0;
  }

  async getCompaniesPaginated(params: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<LegacyCompany>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = this.db().from("companies").select("id, name, description, logo_url, created_at", { count: "exact" });
    if (params.search?.trim()) {
      const term = params.search.trim();
      q = q.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
    const { data, error, count } = await q.order("created_at", { ascending: false }).range(from, to);
    this.handleError(error);
    const total = count ?? 0;
    return {
      data: (data ?? []).map(rowToCompany),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ——— Medicines ———
  async getAllMedicines(): Promise<LegacyMedicine[]> {
    const { data, error } = await this.db().from("medicines").select("id, name, sub_name, description, company_id, category_id, created_at").order("name");
    this.handleError(error);
    return (data ?? []).map(rowToMedicine);
  }

  async getMedicine(id: string) {
    const { data, error } = await this.db()
      .from("medicines")
      .select("id, name, sub_name, description, company_id, category_id, created_at")
      .eq("id", id)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToMedicine(data) : undefined;
  }

  async getMedicinesByCompany(companyId: string) {
    const { data, error } = await this.db()
      .from("medicines")
      .select("id, name, sub_name, description, company_id, category_id, created_at")
      .eq("company_id", companyId);
    this.handleError(error);
    return (data ?? []).map(rowToMedicine);
  }

  async getMedicinesPaginated(params: {
    companyId?: string;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<LegacyMedicine>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = this.db().from("medicines").select("id, name, sub_name, description, company_id, category_id, created_at", { count: "exact" });
    if (params.companyId) q = q.eq("company_id", params.companyId);
    if (params.categoryId) q = q.eq("category_id", params.categoryId);
    if (params.search?.trim()) {
      const term = params.search.trim();
      const [companiesRes, categoriesRes] = await Promise.all([
        this.db().from("companies").select("id").ilike("name", `%${term}%`),
        this.db().from("categories").select("id").ilike("name", `%${term}%`),
      ]);
      this.handleError(companiesRes.error);
      this.handleError(categoriesRes.error);
      const companyIds = (companiesRes.data ?? []).map((r) => r.id as string);
      const categoryIds = (categoriesRes.data ?? []).map((r) => r.id as string);
      const orParts = [
        `name.ilike.%${term}%`,
        `sub_name.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ];
      if (companyIds.length) orParts.push(`company_id.in.(${companyIds.join(",")})`);
      if (categoryIds.length) orParts.push(`category_id.in.(${categoryIds.join(",")})`);
      q = q.or(orParts.join(","));
    }
    const { data, error, count } = await q.order("created_at", { ascending: false }).range(from, to);
    this.handleError(error);
    const total = count ?? 0;
    const medicines = (data ?? []).map(rowToMedicine);
    const enriched = await this.enrichMedicinesWithRelations(medicines);
    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private async enrichMedicinesWithRelations(medicines: LegacyMedicine[]) {
    if (!medicines.length) return medicines;
    const companyIds = Array.from(new Set(medicines.map((m) => m.companyId)));
    const categoryIds = Array.from(new Set(medicines.map((m) => m.categoryId)));
    const [companiesRes, categoriesRes] = await Promise.all([
      this.db().from("companies").select("id, name").in("id", companyIds),
      this.db().from("categories").select("id, name").in("id", categoryIds),
    ]);
    this.handleError(companiesRes.error);
    this.handleError(categoriesRes.error);
    const companyMap = new Map(
      (companiesRes.data ?? []).map((r) => [r.id as string, r.name as string]),
    );
    const categoryMap = new Map(
      (categoriesRes.data ?? []).map((r) => [r.id as string, r.name as string]),
    );
    return medicines.map((m) => ({
      ...m,
      companyName: companyMap.get(m.companyId) ?? "Unknown",
      categoryName: categoryMap.get(m.categoryId) ?? "Unknown",
    }));
  }

  async searchAll(query: string) {
    const term = `%${query}%`;
    const [companiesRes, medicinesRes] = await Promise.all([
      this.db()
        .from("companies")
        .select("id, name, description, logo_url, created_at")
        .or(`name.ilike.${term},description.ilike.${term}`)
        .limit(10),
      this.db()
        .from("medicines")
        .select("id, name, sub_name, description, company_id, category_id, created_at")
        .or(`name.ilike.${term},sub_name.ilike.${term}`)
        .limit(10),
    ]);
    this.handleError(companiesRes.error);
    this.handleError(medicinesRes.error);
    return {
      companies: (companiesRes.data ?? []).map(rowToCompany),
      medicines: (medicinesRes.data ?? []).map(rowToMedicine),
    };
  }

  private async medicineNameExists(name: string, excludeId?: string): Promise<boolean> {
    const { data, error } = await this.db()
      .from("medicines")
      .select("id, name")
      .ilike("name", name.trim());
    this.handleError(error);
    return (data ?? []).some(
      (row) =>
        (row.name as string).trim().toLowerCase() === name.trim().toLowerCase() &&
        row.id !== excludeId,
    );
  }

  async createMedicine(medicine: {
    name: string;
    subname?: string | null;
    description?: string | null;
    companyId: string;
    categoryId: string;
  }) {
    if (await this.medicineNameExists(medicine.name)) {
      throw new DuplicateError("Medicine");
    }
    const { data, error } = await this.db()
      .from("medicines")
      .insert(
        medicineInput({
          name: medicine.name.trim(),
          subname: medicine.subname ?? undefined,
          description: medicine.description ?? undefined,
          companyId: medicine.companyId,
          categoryId: medicine.categoryId,
        }),
      )
      .select()
      .single();
    this.handleError(error);
    return rowToMedicine(data);
  }

  async updateMedicine(
    id: string,
    medicine: Partial<{
      name: string;
      subname?: string | null;
      description?: string | null;
      companyId: string;
      categoryId: string;
    }>,
  ) {
    const patch: Record<string, string> = {};
    if (medicine.name) {
      if (await this.medicineNameExists(medicine.name, id)) {
        throw new DuplicateError("Medicine");
      }
      patch.name = medicine.name.trim();
    }
    if (medicine.subname !== undefined) patch.sub_name = medicine.subname ?? "";
    if (medicine.description !== undefined) patch.description = medicine.description ?? "";
    if (medicine.companyId) patch.company_id = medicine.companyId;
    if (medicine.categoryId) patch.category_id = medicine.categoryId;
    const { data, error } = await this.db()
      .from("medicines")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);
    return data ? rowToMedicine(data) : undefined;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const { error, count } = await this.db()
      .from("medicines")
      .delete({ count: "exact" })
      .eq("id", id);
    this.handleError(error);
    return (count ?? 0) > 0;
  }

  // ——— Queries (contact / messages) ———
  async getAllMessages(): Promise<LegacyMessage[]> {
    const { data, error } = await this.db()
      .from("queries")
      .select("id, user_id, name, phone, message, resolved, created_at")
      .order("created_at", { ascending: false });
    this.handleError(error);
    return (data ?? []).map((r) => queryToLegacyMessage(rowToQuery(r)));
  }

  async getQueriesPaginated(params: {
    search?: string;
    page?: number;
    limit?: number;
    resolved?: boolean;
  }): Promise<PaginatedResult<Query>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = this.db().from("queries").select("id, user_id, name, phone, message, resolved, created_at", { count: "exact" });
    if (params.resolved !== undefined) q = q.eq("resolved", params.resolved);
    if (params.search) {
      q = q.or(
        `name.ilike.%${params.search}%,phone.ilike.%${params.search}%,message.ilike.%${params.search}%`,
      );
    }
    const { data, error, count } = await q
      .order("created_at", { ascending: false })
      .range(from, to);
    this.handleError(error);
    const total = count ?? 0;
    return {
      data: (data ?? []).map(rowToQuery),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async createMessage(message: {
    name: string;
    email?: string;
    phone?: string;
    message: string;
    userId?: string;
  }) {
    const { data, error } = await this.db()
      .from("queries")
      .insert({
        name: message.name,
        phone: message.phone ?? "",
        email: message.email ?? null,
        message: message.message,
        user_id: message.userId ?? null,
      })
      .select()
      .single();
    this.handleError(error);
    return queryToLegacyMessage(rowToQuery(data));
  }

  async resolveQuery(id: string, resolved: boolean) {
    const { data, error } = await this.db()
      .from("queries")
      .update({ resolved })
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);
    return data ? rowToQuery(data) : undefined;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const { error, count } = await this.db()
      .from("queries")
      .delete({ count: "exact" })
      .eq("id", id);
    this.handleError(error);
    return (count ?? 0) > 0;
  }

  // ——— Cart ———
  async getCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await this.db()
      .from("cart_items")
      .select("id, user_id, medicine_id, quantity")
      .eq("user_id", userId);
    this.handleError(error);
    return (data ?? []).map(rowToCartItem);
  }

  async addCartItem(item: {
    userId: string;
    medicineId: string;
    quantity: number;
  }) {
    const existing = await this.db()
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", item.userId)
      .eq("medicine_id", item.medicineId)
      .maybeSingle();

    if (existing.data) {
      return this.updateCartItem(
        existing.data.id as string,
        (existing.data.quantity as number) + item.quantity,
      );
    }

    const { data, error } = await this.db()
      .from("cart_items")
      .insert({
        user_id: item.userId,
        medicine_id: item.medicineId,
        quantity: item.quantity,
      })
      .select()
      .single();
    this.handleError(error);
    return rowToCartItem(data);
  }

  async updateCartItem(id: string, quantity: number) {
    const { data, error } = await this.db()
      .from("cart_items")
      .update({ quantity })
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);
    return data ? rowToCartItem(data) : undefined;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const { error, count } = await this.db()
      .from("cart_items")
      .delete({ count: "exact" })
      .eq("id", id);
    this.handleError(error);
    return (count ?? 0) > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const { error } = await this.db()
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    this.handleError(error);
    return true;
  }

  // ——— Orders ———
  async createOrder(
    order: { userId: string; status?: string; address?: string },
    items: { medicineId: string; quantity: number }[],
  ) {
    const { data: orderRow, error: orderError } = await this.db()
      .from("orders")
      .insert({
        user_id: order.userId,
        status: order.status ?? "pending",
        address: order.address ?? "",
      })
      .select()
      .single();
    this.handleError(orderError);

    const orderItems = items.map((i) => ({
      order_id: orderRow.id,
      medicine_id: i.medicineId,
      quantity: i.quantity,
    }));
    const { error: itemsError } = await this.db()
      .from("order_items")
      .insert(orderItems);
    this.handleError(itemsError);

    return rowToOrder(orderRow);
  }

  async getOrder(id: string) {
    const { data, error } = await this.db()
      .from("orders")
      .select("id, user_id, status, address, created_at")
      .eq("id", id)
      .maybeSingle();
    this.handleError(error);
    return data ? rowToOrder(data) : undefined;
  }

  async getOrderItems(orderId: string) {
    const { data, error } = await this.db()
      .from("order_items")
      .select("id, order_id, medicine_id, quantity, tracked")
      .eq("order_id", orderId);
    this.handleError(error);
    return (data ?? []).map(rowToOrderItem);
  }

  async getUserOrders(userId: string) {
    const { data, error } = await this.db()
      .from("orders")
      .select("id, user_id, status, address, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    this.handleError(error);
    return (data ?? []).map(rowToOrder);
  }

  async getOrdersPaginated(params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<Order & { totalAmount: string; user?: Profile }>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let matchingUserIds: string[] | undefined;
    if (params.search?.trim()) {
      const term = params.search.trim();
      const { data: profiles, error: profileError } = await this.db()
        .from("profiles")
        .select("id")
        .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
      this.handleError(profileError);
      matchingUserIds = (profiles ?? []).map((p) => p.id as string);
    }

    let q = this.db().from("orders").select("id, user_id, status, address, created_at", { count: "exact" });
    if (params.status && params.status !== "all") q = q.eq("status", params.status);
    if (params.search?.trim()) {
      const term = params.search.trim();
      const orParts = [`address.ilike.%${term}%`, `status.ilike.%${term}%`];
      if (matchingUserIds?.length) {
        orParts.push(`user_id.in.(${matchingUserIds.join(",")})`);
      }
      q = q.or(orParts.join(","));
    }
    const { data, error, count } = await q
      .order("created_at", { ascending: false })
      .range(from, to);
    this.handleError(error);
    const orders = (data ?? []).map(rowToOrder);
    const userIds = Array.from(new Set(orders.map((o) => o.userId)));
    const userMap = new Map<string, Profile>();
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await this.db()
        .from("profiles")
        .select()
        .in("id", userIds);
      this.handleError(profileError);
      for (const row of profiles ?? []) {
        const profile = rowToProfile(row);
        userMap.set(profile.id, profile);
      }
    }
    const total = count ?? 0;
    return {
      data: orders.map((o) => ({ ...o, user: userMap.get(o.userId) })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateOrderStatus(id: string, status: string) {
    // Fetch current order to enforce status-lock rules
    const { data: current, error: fetchError } = await this.db()
      .from("orders")
      .select("id, user_id, status, address, created_at")
      .eq("id", id)
      .maybeSingle();
    this.handleError(fetchError);

    if (!current) throw new Error("Order not found");

    const LOCKED_DOWNGRADES = ["pending", "confirmed"];
    if (
      current.status === "shipped" &&
      LOCKED_DOWNGRADES.includes(status)
    ) {
      throw new Error(
        "Cannot change a shipped order back to pending or confirmed.",
      );
    }

    const { data, error } = await this.db()
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();
    this.handleError(error);

    if (!data) return undefined;

    const order = rowToOrder(data);

    // Fetch user profile so caller can build WhatsApp notification link
    const { data: profileRow, error: profileError } = await this.db()
      .from("profiles")
      .select("id, name, phone, email, is_active, account_setup_complete, created_at")
      .eq("id", order.userId)
      .maybeSingle();
    this.handleError(profileError);

    return {
      ...order,
      user: profileRow ? rowToProfile(profileRow) : undefined,
    };
  }

  async getDashboardStats() {
    const [companies, medicines, profiles, orders, queries, categories] = await Promise.all([
      this.db().from("companies").select("id", { count: "exact", head: true }),
      this.db().from("medicines").select("id", { count: "exact", head: true }),
      this.db().from("profiles").select("id", { count: "exact", head: true }),
      this.db().from("orders").select("id", { count: "exact", head: true }),
      this.db()
        .from("queries")
        .select("id", { count: "exact", head: true })
        .eq("resolved", false),
      this.db().from("categories").select("id", { count: "exact", head: true }),
    ]);
    return {
      companies: companies.count ?? 0,
      medicines: medicines.count ?? 0,
      users: profiles.count ?? 0,
      orders: orders.count ?? 0,
      openQueries: queries.count ?? 0,
      categories: categories.count ?? 0,
    };
  }

  async getDashboardChartsData() {
    // 1. Order status distribution
    const { data: statusRows, error: statusError } = await this.db()
      .from("orders")
      .select("status");
    this.handleError(statusError);
    
    const statusCounts: Record<string, number> = {};
    for (const row of statusRows ?? []) {
      const status = row.status as string;
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    }
    const statusData = Object.entries(statusCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // 2. Orders trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: trendRows, error: trendError } = await this.db()
      .from("orders")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString());
    this.handleError(trendError);

    // Group orders by date
    const trendMap = new Map<string, { date: string; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap.set(d.toISOString().split("T")[0], { date: dateStr, orders: 0 });
    }

    for (const row of trendRows ?? []) {
      const dateKey = (row.created_at as string).split("T")[0];
      if (trendMap.has(dateKey)) {
        const current = trendMap.get(dateKey)!;
        current.orders++;
        trendMap.set(dateKey, current);
      }
    }
    const orderTrend = Array.from(trendMap.values());

    // 3. Category distribution (number of medicines per category)
    const { data: meds, error: medsError } = await this.db()
      .from("medicines")
      .select("category_id");
    this.handleError(medsError);

    const { data: cats, error: catsError } = await this.db()
      .from("categories")
      .select("id, name");
    this.handleError(catsError);

    const categoryMap = new Map<string, string>();
    for (const c of cats ?? []) {
      categoryMap.set(c.id as string, c.name as string);
    }

    const catCounts: Record<string, number> = {};
    for (const m of meds ?? []) {
      const catName = categoryMap.get(m.category_id as string) ?? "Other";
      catCounts[catName] = (catCounts[catName] ?? 0) + 1;
    }

    const categoryData = Object.entries(catCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      statusData,
      orderTrend,
      categoryData,
    };
  }

  // Legacy admin stubs
  async getAdmin(_id: string) {
    return undefined;
  }
  async getAdminByUsername(_username: string) {
    return undefined;
  }
  async createAdmin(_admin: unknown) {
    throw new Error("Use ADMIN_EMAIL / ADMIN_PASSWORD env vars");
  }
}

export const storage = new SupabaseStorage();
export const connectMongoDB = storage.connectDatabase.bind(storage);
