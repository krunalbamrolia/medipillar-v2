import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertAdminSchema,
  insertCategorySchema,
  insertCompanySchema,
  insertMedicineSchema,
  insertMessageSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import { DuplicateError } from "./errors";
import { requireAdmin, requireUser, verifySupabaseAccessToken } from "./middleware";
import { databaseSetupHint, isMissingTableError, verifyDatabaseTables } from "./db-health";
import { z } from "zod";

const profileSyncSchema = z.object({
  accessToken: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
});

// Create partial schemas for PATCH endpoints
const updateCategorySchema = insertCategorySchema.partial();
const updateCompanySchema = insertCompanySchema.partial();
const updateMedicineSchema = insertMedicineSchema.partial();

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health/db", async (_req, res) => {
    const result = await verifyDatabaseTables();
    if (result.ok) return res.json({ ok: true });
    res.status(503).json({ ok: false, missing: result.missing, hint: databaseSetupHint() });
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({
        companies: stats.companies,
        medicines: stats.medicines,
        orders: stats.orders,
        categories: stats.categories,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin authentication (credentials from environment variables)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password, username } = req.body;
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminEmail || !adminPassword) {
        return res.status(500).json({ error: "Admin credentials not configured" });
      }

      const loginEmail = email ?? username;
      if (loginEmail !== adminEmail || password !== adminPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.adminId = "admin";
      res.json({ success: true, admin: { email: adminEmail } });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.adminId = undefined;
    res.json({ success: true });
  });

  app.get("/api/admin/me", (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ error: "Unauthorized" });
    res.json({ authenticated: true });
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const charts = await storage.getDashboardChartsData();
      res.json({ ...stats, ...charts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { search, page, limit } = req.query;
      const result = await storage.getUsersPaginated({
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getAdminUserDetail(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/admin/users/:id/orders", requireAdmin, async (req, res) => {
    try {
      const { page, limit, medicineName, quantity } = req.query;
      const parsedQty = quantity !== undefined && quantity !== "" ? parseInt(quantity as string, 10) : undefined;
      const result = await storage.getAdminUserOrdersPaginated(req.params.id, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        medicineName: medicineName as string,
        quantity: parsedQty,
      });
      if (!result) return res.status(404).json({ error: "User not found" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user orders" });
    }
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }
      const user = await storage.updateUserStatus(req.params.id, isActive);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.get("/api/admin/queries", requireAdmin, async (req, res) => {
    try {
      const { search, page, limit, resolved } = req.query;
      const result = await storage.getQueriesPaginated({
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        resolved:
          resolved === "true" ? true : resolved === "false" ? false : undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queries" });
    }
  });

  app.patch("/api/admin/queries/:id/resolve", requireAdmin, async (req, res) => {
    try {
      const { resolved } = req.body;
      const query = await storage.resolveQuery(req.params.id, Boolean(resolved));
      if (!query) return res.status(404).json({ error: "Query not found" });
      res.json(query);
    } catch (error) {
      res.status(500).json({ error: "Failed to update query" });
    }
  });

  // Category routes
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/paginated", async (req, res) => {
    try {
      const { search, page, limit } = req.query;
      const result = await storage.getCategoriesPaginated({
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: "Invalid category data" });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const validated = updateCategorySchema.parse(req.body);
      const category = await storage.updateCategory(req.params.id, validated);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid category data", details: error.errors });
      }
      res.status(400).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

// Company routes
    app.get("/api/companies", async (_req, res) => {
      try {
        const companies = await storage.getAllCompanies();
        res.json(companies);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch companies" });
      }
    });

    app.get("/api/companies/paginated", async (req, res) => {
      try {
        const { search, page, limit } = req.query;
        const result = await storage.getCompaniesPaginated({
          search: search as string,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch companies" });
      }
    });

    app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validated = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validated);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: "Invalid company data" });
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const validated = updateCompanySchema.parse(req.body);
      const company = await storage.updateCompany(req.params.id, validated);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error: any) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid company data", details: error.errors });
      }
      res.status(400).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

// Medicine routes
    app.get("/api/medicines", async (_req, res) => {
      try {
        const medicines = await storage.getAllMedicines();
        res.json(medicines);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch medicines" });
      }
    });

    app.get("/api/medicines/paginated", async (req, res) => {
      try {
        const { companyId, categoryId, search, page, limit } = req.query;
        const result = await storage.getMedicinesPaginated({
          companyId: companyId as string,
          categoryId: categoryId as string,
          search: search as string,
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch medicines" });
      }
    });

    app.get("/api/search", async (req, res) => {
      try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
          return res.json({ companies: [], medicines: [] });
        }
        const result = await storage.searchAll(q);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to search" });
      }
    });

    app.get("/api/medicines/:id", async (req, res) => {
    try {
      const medicine = await storage.getMedicine(req.params.id);
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medicine" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    try {
      const validated = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validated);
      res.status(201).json(medicine);
    } catch (error) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: "Invalid medicine data" });
    }
  });

  app.patch("/api/medicines/:id", async (req, res) => {
    try {
      const validated = updateMedicineSchema.parse(req.body);
      const medicine = await storage.updateMedicine(req.params.id, validated);
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error: any) {
      if (error instanceof DuplicateError) {
        return res.status(409).json({ error: error.message });
      }
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid medicine data", details: error.errors });
      }
      res.status(400).json({ error: "Failed to update medicine" });
    }
  });

  app.delete("/api/medicines/:id", async (req, res) => {
    try {
      const success = await storage.deleteMedicine(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete medicine" });
    }
  });

  // Message routes
  app.get("/api/messages", async (_req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validated = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage({
        ...validated,
        phone: validated.phone ?? undefined,
        userId: req.session.userId,
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const success = await storage.deleteMessage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Sync Supabase phone-auth session to server session + profiles table
  app.post("/api/auth/session", async (req, res) => {
    try {
      const parsed = profileSyncSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid profile data" });
      }

      const { accessToken, name, phone, email } = parsed.data;
      const userId = await verifySupabaseAccessToken(accessToken);
      if (!userId) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }

      const user = await storage.upsertProfile({
        id: userId,
        name,
        phone,
        email: email || null,
      });

      req.session.userId = user.id;
      res.json({ success: true, user });
    } catch (error: unknown) {
      console.error("Failed to sync session:", error);
      if (isMissingTableError(error) || (error instanceof Error && error.message.includes("setup_all_tables"))) {
        return res.status(503).json({ error: databaseSetupHint() });
      }
      const message = error instanceof Error ? error.message : "Failed to sync session";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
    try {
      const user = await storage.getUser(req.session.userId as string);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Cart Routes
  app.get("/api/cart", requireUser, async (req, res) => {
    try {
      const items = await storage.getCartItems(req.session.userId as string);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", requireUser, async (req, res) => {
    try {
      const { medicineId, quantity } = req.body;
      const item = await storage.addCartItem({
        userId: req.session.userId as string,
        medicineId,
        quantity,
      });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", requireUser, async (req, res) => {
    try {
      const item = await storage.updateCartItem(req.params.id, req.body.quantity);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:id", requireUser, async (req, res) => {
    try {
      await storage.removeCartItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  // Order Routes (User)
  app.post("/api/orders", requireUser, async (req, res) => {
    try {
      const userId = req.session.userId as string;
      const { address } = req.body;
      const items = await storage.getCartItems(userId);
      if (!items.length) return res.status(400).json({ error: "Cart is empty" });

      const orderItems = items.map((i) => ({
        medicineId: i.medicineId,
        quantity: i.quantity,
      }));

      const order = await storage.createOrder(
        { userId, status: "pending", address },
        orderItems,
      );
      await storage.clearCart(userId);
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", requireUser, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.session.userId as string);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.session.userId && !req.session.adminId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ error: "Order not found" });
      const items = await storage.getOrderItemsWithDetails(order.id);
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  // Admin Order Routes
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const { status, search, page, limit } = req.query;
      const orders = await storage.getOrdersPaginated({ 
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string) : 1, 
        limit: limit ? parseInt(limit as string) : 10 
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.patch("/api/admin/order-items/:id/tracked", requireAdmin, async (req, res) => {
    try {
      const { tracked } = req.body;
      if (typeof tracked !== "boolean") {
        return res.status(400).json({ error: "tracked must be a boolean" });
      }
      const item = await storage.updateOrderItemTracked(req.params.id, tracked);
      if (!item) return res.status(404).json({ error: "Order item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item tracking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
