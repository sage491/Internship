import {
  inventoryItems as memoryInventory,
  requiredItemsData as memoryRequired,
  stockInData as memoryStockIn,
  stockOutData as memoryStockOut,
  suppliersData as memorySuppliers,
  usedItemsData as memoryUsed,
  usersData as memoryUsers,
} from "./store.js";
import { buildDashboardData } from "./buildDashboard.js";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase.js";
import type { InventoryItem, RequiredItem, StockInItem, StockOutItem, SupplierItem, UsedItem, UserItem } from "../types.js";

type InventoryRow = {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  min_stock: number;
  location: string;
  status: string;
  last_updated: string;
};

type UsedItemRow = {
  id: string;
  item: string;
  quantity: number;
  department: string;
  issued_by: string;
  date: string;
  remarks: string;
};

type RequiredItemRow = {
  item: string;
  current_qty: number;
  required_qty: number;
  deficit: number;
  priority: string;
  status: string;
};

type StockInRow = {
  id: string;
  item: string;
  supplier: string;
  quantity: number;
  po_number: string;
  date: string;
  remarks: string;
};

type StockOutRow = {
  id: string;
  item: string;
  quantity: number;
  department: string;
  employee: string;
  date: string;
  purpose: string;
};

type SupplierRow = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: string;
};

type UserRow = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: string;
  last_login: string;
  password: string | null;
};

function mapInventory(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    minStock: row.min_stock,
    location: row.location,
    status: row.status as InventoryItem["status"],
    lastUpdated: row.last_updated,
  };
}

function mapUsedItem(row: UsedItemRow): UsedItem {
  return {
    id: row.id,
    item: row.item,
    quantity: row.quantity,
    department: row.department,
    issuedBy: row.issued_by,
    date: row.date,
    remarks: row.remarks,
  };
}

function mapRequiredItem(row: RequiredItemRow): RequiredItem {
  return {
    item: row.item,
    current: row.current_qty,
    required: row.required_qty,
    deficit: row.deficit,
    priority: row.priority as RequiredItem["priority"],
    status: row.status,
  };
}

function mapStockIn(row: StockInRow): StockInItem {
  return {
    id: row.id,
    item: row.item,
    supplier: row.supplier,
    quantity: row.quantity,
    poNumber: row.po_number,
    date: row.date,
    remarks: row.remarks,
  };
}

function mapStockOut(row: StockOutRow): StockOutItem {
  return {
    id: row.id,
    item: row.item,
    quantity: row.quantity,
    department: row.department,
    employee: row.employee,
    date: row.date,
    purpose: row.purpose,
  };
}

function mapSupplier(row: SupplierRow): SupplierItem {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    phone: row.phone,
    email: row.email,
    address: row.address,
    status: row.status,
  };
}

function mapUser(row: UserRow): UserItem {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    email: row.email,
    status: row.status,
    lastLogin: row.last_login,
  };
}

export function getDataSource(): "supabase" | "memory" {
  return isSupabaseConfigured() ? "supabase" : "memory";
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured()) {
    return memoryInventory.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase()
    .from("inventory_items")
    .select("*")
    .order("last_updated", { ascending: false });

  if (error) throw error;
  return (data as InventoryRow[]).map(mapInventory);
}

export async function upsertInventoryItem(item: InventoryItem): Promise<InventoryItem> {
  if (!isSupabaseConfigured()) {
    const existingIndex = memoryInventory.findIndex((x) => x.id === item.id);
    if (existingIndex >= 0) {
      memoryInventory[existingIndex] = item;
    } else {
      memoryInventory.unshift(item);
    }
    return { ...item };
  }

  const { data, error } = await getSupabase()
    .from("inventory_items")
    .upsert({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      min_stock: item.minStock,
      location: item.location,
      status: item.status,
      last_updated: item.lastUpdated,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapInventory(data as InventoryRow);
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const index = memoryInventory.findIndex((item) => item.id === id);
    if (index < 0) return false;
    memoryInventory.splice(index, 1);
    return true;
  }

  const { error, count } = await getSupabase()
    .from("inventory_items")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getUsedItems(): Promise<UsedItem[]> {
  if (!isSupabaseConfigured()) {
    return memoryUsed.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase().from("used_items").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data as UsedItemRow[]).map(mapUsedItem);
}

export async function getRequiredItems(): Promise<RequiredItem[]> {
  if (!isSupabaseConfigured()) {
    return memoryRequired.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase().from("required_items").select("*").order("deficit", { ascending: false });
  if (error) throw error;
  return (data as RequiredItemRow[]).map(mapRequiredItem);
}

export async function getStockInItems(): Promise<StockInItem[]> {
  if (!isSupabaseConfigured()) {
    return memoryStockIn.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase().from("stock_in").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data as StockInRow[]).map(mapStockIn);
}

export async function getStockOutItems(): Promise<StockOutItem[]> {
  if (!isSupabaseConfigured()) {
    return memoryStockOut.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase().from("stock_out").select("*").order("date", { ascending: false });
  if (error) throw error;
  return (data as StockOutRow[]).map(mapStockOut);
}

export async function getSuppliers(): Promise<SupplierItem[]> {
  if (!isSupabaseConfigured()) {
    return memorySuppliers.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase().from("suppliers").select("*").order("name");
  if (error) throw error;
  return (data as SupplierRow[]).map(mapSupplier);
}

export async function getUsers(): Promise<UserItem[]> {
  if (!isSupabaseConfigured()) {
    return memoryUsers.map((item) => ({ ...item }));
  }

  const { data, error } = await getSupabase().from("users").select("id, name, role, department, email, status, last_login").order("name");
  if (error) throw error;
  return (data as UserRow[]).map(mapUser);
}

export async function getDashboardData() {
  const [inventory, used, required, stockIn, stockOut] = await Promise.all([
    getInventoryItems(),
    getUsedItems(),
    getRequiredItems(),
    getStockInItems(),
    getStockOutItems(),
  ]);

  return buildDashboardData(inventory, used, required, stockIn, stockOut);
}

export type AuthProfile = {
  employeeId: string;
  name: string;
  role: string;
  department: string;
};

export async function findUserForAuth(employeeId: string): Promise<AuthProfile | null> {
  if (!isSupabaseConfigured()) {
    const user = memoryUsers.find((item) => item.id === employeeId);
    if (!user) return null;
    return {
      employeeId: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
    };
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("id, name, role, department, password")
    .eq("id", employeeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    employeeId: data.id,
    name: data.name,
    role: data.role,
    department: data.department,
  };
}

export async function validateUserPassword(employeeId: string, password: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    if (employeeId === "EMP-1001") {
      return password === "admin123";
    }
    return false;
  }

  const { data, error } = await getSupabase()
    .from("users")
    .select("password")
    .eq("id", employeeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;
  if (!data.password) return true;
  return data.password === password;
}
