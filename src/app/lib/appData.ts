import {
  categoryData,
  inventoryItems as seedInventoryItems,
  kpiData,
  monthlyConsumptionData,
  recentActivity,
  requiredItemsData,
  stockInData,
  stockOutData,
  suppliersData,
  usageTrendData,
  usedItemsData,
  usersData,
} from "../data/mockData";
import { getAuthHeaders } from "./auth";

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

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const USE_REMOTE = Boolean(API_BASE);

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    ...init,
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

let inventoryStore: InventoryItem[] = seedInventoryItems.map((item) => ({ ...item }));
let usedItemsStore: UsedItem[] = usedItemsData.map((item) => ({ ...item }));
let requiredItemsStore: RequiredItem[] = requiredItemsData.map((item) => ({ ...item }));
let stockInStore: StockInItem[] = stockInData.map((item) => ({ ...item }));
let stockOutStore: StockOutItem[] = stockOutData.map((item) => ({ ...item }));
let suppliersStore: SupplierItem[] = suppliersData.map((item) => ({ ...item }));
let usersStore: UserItem[] = usersData.map((item) => ({ ...item }));

export async function getInventoryItems(): Promise<InventoryItem[]> {
  if (USE_REMOTE) {
    return requestJson<InventoryItem[]>("/api/inventory");
  }
  await delay();
  return inventoryStore.map((item) => ({ ...item }));
}

export async function createInventoryItem(item: InventoryItem): Promise<InventoryItem> {
  if (USE_REMOTE) {
    return requestJson<InventoryItem>("/api/inventory", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }
  await delay();
  inventoryStore = [item, ...inventoryStore.filter((current) => current.id !== item.id)];
  return { ...item };
}

export async function removeInventoryItem(id: string): Promise<void> {
  if (USE_REMOTE) {
    await requestJson<void>(`/api/inventory/${id}`, { method: "DELETE" });
    return;
  }
  await delay();
  inventoryStore = inventoryStore.filter((item) => item.id !== id);
}

export async function getDashboardData() {
  if (USE_REMOTE) {
    return requestJson<{
      kpiData: typeof kpiData;
      usageTrendData: typeof usageTrendData;
      categoryData: typeof categoryData;
      monthlyConsumptionData: typeof monthlyConsumptionData;
      recentActivity: DashboardActivity[];
    }>("/api/dashboard");
  }
  await delay();
  return {
    kpiData,
    usageTrendData,
    categoryData,
    monthlyConsumptionData,
    recentActivity: recentActivity.map((item) => ({ ...item })) as DashboardActivity[],
  };
}

export async function getReferenceData() {
  if (USE_REMOTE) {
    return requestJson<{
      requiredItemsData: RequiredItem[];
      stockInData: StockInItem[];
      stockOutData: StockOutItem[];
      suppliersData: SupplierItem[];
      usedItemsData: UsedItem[];
      usersData: UserItem[];
    }>("/api/reference");
  }
  await delay();
  return {
    requiredItemsData: requiredItemsStore.map((item) => ({ ...item })),
    stockInData: stockInStore.map((item) => ({ ...item })),
    stockOutData: stockOutStore.map((item) => ({ ...item })),
    suppliersData: suppliersStore.map((item) => ({ ...item })),
    usedItemsData: usedItemsStore.map((item) => ({ ...item })),
    usersData: usersStore.map((item) => ({ ...item })),
  };
}

export async function getUsedItems(): Promise<UsedItem[]> {
  if (USE_REMOTE) {
    return requestJson<UsedItem[]>("/api/used-items");
  }
  await delay();
  return usedItemsStore.map((item) => ({ ...item }));
}

export async function getRequiredItems(): Promise<RequiredItem[]> {
  if (USE_REMOTE) {
    return requestJson<RequiredItem[]>("/api/required-items");
  }
  await delay();
  return requiredItemsStore.map((item) => ({ ...item }));
}

export async function getStockInItems(): Promise<StockInItem[]> {
  if (USE_REMOTE) {
    return requestJson<StockInItem[]>("/api/stock-in");
  }
  await delay();
  return stockInStore.map((item) => ({ ...item }));
}

export async function getStockOutItems(): Promise<StockOutItem[]> {
  if (USE_REMOTE) {
    return requestJson<StockOutItem[]>("/api/stock-out");
  }
  await delay();
  return stockOutStore.map((item) => ({ ...item }));
}

export async function getSuppliers(): Promise<SupplierItem[]> {
  if (USE_REMOTE) {
    return requestJson<SupplierItem[]>("/api/suppliers");
  }
  await delay();
  return suppliersStore.map((item) => ({ ...item }));
}

export async function getUsers(): Promise<UserItem[]> {
  if (USE_REMOTE) {
    return requestJson<UserItem[]>("/api/users");
  }
  await delay();
  return usersStore.map((item) => ({ ...item }));
}
