import type { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import express from "express";
import {
  createStockInItem,
  createStockOutItem,
  createSupplier,
  createUser,
  deleteInventoryItem,
  findUserForAuth,
  getDashboardData,
  getDataSource,
  getInventoryItems,
  getRequiredItems,
  getStockInItems,
  getStockOutItems,
  getSuppliers,
  getUsedItems,
  getUsers,
  updateInventoryItem,
  upsertInventoryItem,
  validateUserPassword,
} from "./data/repository.js";
import { checkSupabaseConnection } from "./lib/supabase.js";
import type { InventoryItem, StockInItem, StockOutItem, SupplierItem, UserItem } from "./types.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token.startsWith("session-")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  return next();
}

app.get("/api/health", async (_req, res) => {
  const source = getDataSource();
  const dbConnected = source === "supabase" ? await checkSupabaseConnection() : true;

  res.json({
    ok: dbConnected,
    service: "inventory-backend",
    dataSource: source,
    database: source === "supabase" ? (dbConnected ? "connected" : "disconnected") : "in-memory",
  });
});

app.post("/api/auth/sign-in", async (req, res) => {
  try {
    const employeeId = String(req.body?.employeeId ?? "").trim().toUpperCase();
    const password = String(req.body?.password ?? "").trim();
    const rememberMe = Boolean(req.body?.rememberMe);

    if (!employeeId || !password) {
      return res.status(400).json({ message: "Employee ID and password are required." });
    }

    const storedUser = await findUserForAuth(employeeId);
    const passwordValid = await validateUserPassword(employeeId, password);

    if (!storedUser || !passwordValid) {
      return res.status(401).json({ message: "Invalid employee ID or password." });
    }

    return res.json({
      ...storedUser,
      token: `session-${employeeId.toLowerCase()}`,
      rememberMe,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("POST /api/auth/sign-in", error);
    return res.status(500).json({ message: "Unable to sign in right now." });
  }
});

app.use("/api", requireAuth);

app.get("/api/dashboard", async (_req, res) => {
  try {
    res.json(await getDashboardData());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/dashboard", error);
    res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

app.get("/api/inventory", async (_req, res) => {
  try {
    res.json(await getInventoryItems());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/inventory", error);
    res.status(500).json({ message: "Failed to load inventory." });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const incoming = req.body as Partial<InventoryItem>;
    if (!incoming?.name) {
      return res.status(400).json({ message: "name is required." });
    }

    const quantity = Number(incoming.quantity ?? 0);
    const minStock = Number(incoming.minStock ?? 0);
    const item: InventoryItem = {
      id: incoming.id ?? `INV-${Date.now()}`,
      name: incoming.name,
      category: incoming.category ?? "Consumables",
      unit: incoming.unit ?? "Nos",
      quantity,
      minStock,
      location: incoming.location ?? "Store A",
      status:
        incoming.status ??
        (quantity <= 0 ? "Out of Stock" : quantity < minStock ? "Low Stock" : "In Stock"),
      lastUpdated: incoming.lastUpdated ?? new Date().toISOString().slice(0, 10),
    };

    const saved = await upsertInventoryItem(item);
    return res.status(201).json(saved);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("POST /api/inventory", error);
    res.status(500).json({ message: "Failed to save inventory item." });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  try {
    const saved = await updateInventoryItem(req.params.id, req.body as Partial<InventoryItem>);
    if (!saved) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json(saved);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("PUT /api/inventory/:id", error);
    res.status(500).json({ message: "Failed to update inventory item." });
  }
});

app.delete("/api/inventory/:id", async (req, res) => {
  try {
    const deleted = await deleteInventoryItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(204).send();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("DELETE /api/inventory/:id", error);
    res.status(500).json({ message: "Failed to delete inventory item." });
  }
});

app.get("/api/used-items", async (_req, res) => {
  try {
    res.json(await getUsedItems());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/used-items", error);
    res.status(500).json({ message: "Failed to load used items." });
  }
});

app.get("/api/required-items", async (_req, res) => {
  try {
    res.json(await getRequiredItems());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/required-items", error);
    res.status(500).json({ message: "Failed to load required items." });
  }
});

app.get("/api/stock-in", async (_req, res) => {
  try {
    res.json(await getStockInItems());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/stock-in", error);
    res.status(500).json({ message: "Failed to load stock in records." });
  }
});

app.post("/api/stock-in", async (req, res) => {
  try {
    const incoming = req.body as Partial<StockInItem>;
    if (!incoming?.item || !incoming?.supplier || incoming.quantity === undefined) {
      return res.status(400).json({ message: "item, supplier, and quantity are required." });
    }

    const record: StockInItem = {
      id: incoming.id ?? `GRN-${Date.now()}`,
      item: incoming.item,
      supplier: incoming.supplier,
      quantity: Number(incoming.quantity),
      poNumber: incoming.poNumber ?? "",
      date: incoming.date ?? new Date().toISOString().slice(0, 10),
      remarks: incoming.remarks ?? "",
    };

    const saved = await createStockInItem(record);
    return res.status(201).json(saved);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("POST /api/stock-in", error);
    const message = error instanceof Error ? error.message : "Failed to save stock in record.";
    res.status(500).json({ message });
  }
});

app.get("/api/stock-out", async (_req, res) => {
  try {
    res.json(await getStockOutItems());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/stock-out", error);
    res.status(500).json({ message: "Failed to load stock out records." });
  }
});

app.post("/api/stock-out", async (req, res) => {
  try {
    const incoming = req.body as Partial<StockOutItem>;
    if (!incoming?.item || !incoming?.department || !incoming?.employee || incoming.quantity === undefined) {
      return res.status(400).json({ message: "item, department, employee, and quantity are required." });
    }

    const record: StockOutItem = {
      id: incoming.id ?? `ISS-${Date.now()}`,
      item: incoming.item,
      quantity: Number(incoming.quantity),
      department: incoming.department,
      employee: incoming.employee,
      date: incoming.date ?? new Date().toISOString().slice(0, 10),
      purpose: incoming.purpose ?? "",
    };

    const saved = await createStockOutItem(record);
    return res.status(201).json(saved);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("POST /api/stock-out", error);
    const message = error instanceof Error ? error.message : "Failed to save stock out record.";
    const status = message.includes("Insufficient stock") || message.includes("not found") ? 400 : 500;
    res.status(status).json({ message });
  }
});

app.get("/api/suppliers", async (_req, res) => {
  try {
    res.json(await getSuppliers());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/suppliers", error);
    res.status(500).json({ message: "Failed to load suppliers." });
  }
});

app.post("/api/suppliers", async (req, res) => {
  try {
    const incoming = req.body as Partial<SupplierItem>;
    if (!incoming?.name || !incoming?.contact) {
      return res.status(400).json({ message: "name and contact are required." });
    }

    const supplier: SupplierItem = {
      id: incoming.id ?? `SUP-${Date.now()}`,
      name: incoming.name,
      contact: incoming.contact,
      phone: incoming.phone ?? "",
      email: incoming.email ?? "",
      address: incoming.address ?? "",
      status: incoming.status ?? "Active",
    };

    const saved = await createSupplier(supplier);
    return res.status(201).json(saved);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("POST /api/suppliers", error);
    res.status(500).json({ message: "Failed to save supplier." });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    res.json(await getUsers());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/users", error);
    res.status(500).json({ message: "Failed to load users." });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const incoming = req.body as Partial<UserItem> & { password?: string };
    if (!incoming?.id || !incoming?.name || !incoming?.role || !incoming?.department || !incoming?.email) {
      return res.status(400).json({ message: "id, name, role, department, and email are required." });
    }

    const user: UserItem = {
      id: incoming.id.trim().toUpperCase(),
      name: incoming.name.trim(),
      role: incoming.role,
      department: incoming.department.trim(),
      email: incoming.email.trim(),
      status: incoming.status ?? "Active",
      lastLogin: incoming.lastLogin ?? "",
    };

    const saved = await createUser(user, incoming.password ?? "");
    return res.status(201).json(saved);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("POST /api/users", error);
    res.status(500).json({ message: "Failed to create user." });
  }
});

app.get("/api/reference", async (_req, res) => {
  try {
    const [requiredItemsData, stockInData, stockOutData, suppliersData, usedItemsData, usersData] = await Promise.all([
      getRequiredItems(),
      getStockInItems(),
      getStockOutItems(),
      getSuppliers(),
      getUsedItems(),
      getUsers(),
    ]);

    res.json({
      requiredItemsData,
      stockInData,
      stockOutData,
      suppliersData,
      usedItemsData,
      usersData,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("GET /api/reference", error);
    res.status(500).json({ message: "Failed to load reference data." });
  }
});

app.listen(port, () => {
  const source = getDataSource();
  // eslint-disable-next-line no-console
  console.log(`inventory-backend listening on http://localhost:${port} (${source})`);
});
