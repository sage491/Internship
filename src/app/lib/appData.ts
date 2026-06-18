import { apiRequest } from "./api";

export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  location: string;
  status: InventoryStatus;
  lastUpdated: string;
};

export type DashboardActivity = {
  type: "issued" | "received" | "alert";
  item: string;
  quantity: number;
  dept: string;
  time: string;
  icon: "in" | "out" | "alert";
};

export type UsedItem = {
  id: string;
  item: string;
  quantity: number;
  department: string;
  issuedBy: string;
  date: string;
  remarks: string;
};

export type RequiredItem = {
  item: string;
  current: number;
  required: number;
  deficit: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: string;
};

export type StockInItem = {
  id: string;
  item: string;
  supplier: string;
  quantity: number;
  poNumber: string;
  date: string;
  remarks: string;
};

export type StockOutItem = {
  id: string;
  item: string;
  quantity: number;
  department: string;
  employee: string;
  date: string;
  purpose: string;
};

export type SupplierItem = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  status: string;
};

export type UserItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: string;
  lastLogin: string;
};

export type DashboardData = {
  kpiData: {
    totalItems: number;
    usedItems: number;
    requiredItems: number;
    lowStockItems: number;
    totalValue: number;
  };
  usageTrendData: { month: string; issued: number; received: number }[];
  categoryData: { name: string; value: number; color: string }[];
  monthlyConsumptionData: { month: string; fuel: number; parts: number; safety: number }[];
  recentActivity: DashboardActivity[];
};

export type CreateInventoryInput = Omit<InventoryItem, "id" | "status" | "lastUpdated"> & {
  id?: string;
};

export type CreateStockInInput = Omit<StockInItem, "id"> & { id?: string };

export type CreateStockOutInput = Omit<StockOutItem, "id"> & { id?: string };

export type CreateSupplierInput = Omit<SupplierItem, "id"> & { id?: string };

export type CreateUserInput = Omit<UserItem, "lastLogin"> & {
  password?: string;
  lastLogin?: string;
};

export function computeInventoryStatus(quantity: number, minStock: number): InventoryStatus {
  if (quantity <= 0) return "Out of Stock";
  if (quantity < minStock) return "Low Stock";
  return "In Stock";
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  return apiRequest<InventoryItem[]>("/api/inventory");
}

export async function createInventoryItem(input: CreateInventoryInput): Promise<InventoryItem> {
  const quantity = Number(input.quantity ?? 0);
  const minStock = Number(input.minStock ?? 0);
  const item: InventoryItem = {
    id: input.id ?? `INV-${Date.now()}`,
    name: input.name,
    category: input.category,
    unit: input.unit,
    quantity,
    minStock,
    location: input.location,
    status: computeInventoryStatus(quantity, minStock),
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  return apiRequest<InventoryItem>("/api/inventory", {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function updateInventoryItem(id: string, patch: Partial<InventoryItem>): Promise<InventoryItem> {
  return apiRequest<InventoryItem>(`/api/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export async function removeInventoryItem(id: string): Promise<void> {
  await apiRequest<void>(`/api/inventory/${id}`, { method: "DELETE" });
}

export async function getDashboardData(): Promise<DashboardData> {
  return apiRequest<DashboardData>("/api/dashboard");
}

export async function getReferenceData() {
  return apiRequest<{
    requiredItemsData: RequiredItem[];
    stockInData: StockInItem[];
    stockOutData: StockOutItem[];
    suppliersData: SupplierItem[];
    usedItemsData: UsedItem[];
    usersData: UserItem[];
  }>("/api/reference");
}

export async function getUsedItems(): Promise<UsedItem[]> {
  return apiRequest<UsedItem[]>("/api/used-items");
}

export async function getRequiredItems(): Promise<RequiredItem[]> {
  return apiRequest<RequiredItem[]>("/api/required-items");
}

export async function getStockInItems(): Promise<StockInItem[]> {
  return apiRequest<StockInItem[]>("/api/stock-in");
}

export async function createStockInItem(input: CreateStockInInput): Promise<StockInItem> {
  const record: StockInItem = {
    id: input.id ?? `GRN-${Date.now()}`,
    item: input.item,
    supplier: input.supplier,
    quantity: Number(input.quantity),
    poNumber: input.poNumber,
    date: input.date || new Date().toISOString().slice(0, 10),
    remarks: input.remarks ?? "",
  };

  return apiRequest<StockInItem>("/api/stock-in", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getStockOutItems(): Promise<StockOutItem[]> {
  return apiRequest<StockOutItem[]>("/api/stock-out");
}

export async function createStockOutItem(input: CreateStockOutInput): Promise<StockOutItem> {
  const record: StockOutItem = {
    id: input.id ?? `ISS-${Date.now()}`,
    item: input.item,
    quantity: Number(input.quantity),
    department: input.department,
    employee: input.employee,
    date: input.date || new Date().toISOString().slice(0, 10),
    purpose: input.purpose ?? "",
  };

  return apiRequest<StockOutItem>("/api/stock-out", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function getSuppliers(): Promise<SupplierItem[]> {
  return apiRequest<SupplierItem[]>("/api/suppliers");
}

export async function createSupplier(input: CreateSupplierInput): Promise<SupplierItem> {
  const supplier: SupplierItem = {
    id: input.id ?? `SUP-${Date.now()}`,
    name: input.name,
    contact: input.contact,
    phone: input.phone,
    email: input.email,
    address: input.address,
    status: input.status ?? "Active",
  };

  return apiRequest<SupplierItem>("/api/suppliers", {
    method: "POST",
    body: JSON.stringify(supplier),
  });
}

export async function getUsers(): Promise<UserItem[]> {
  return apiRequest<UserItem[]>("/api/users");
}

export async function createUser(input: CreateUserInput): Promise<UserItem> {
  return apiRequest<UserItem>("/api/users", {
    method: "POST",
    body: JSON.stringify({
      id: input.id,
      name: input.name,
      role: input.role,
      department: input.department,
      email: input.email,
      status: input.status,
      lastLogin: input.lastLogin ?? "",
      password: input.password ?? "",
    }),
  });
}
