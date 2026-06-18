import type {
  InventoryItem,
  RequiredItem,
  StockInItem,
  StockOutItem,
  SupplierItem,
  UsedItem,
  UserItem,
} from "../types.js";

export const inventoryItems: InventoryItem[] = [];

export const usedItemsData: UsedItem[] = [];

export const requiredItemsData: RequiredItem[] = [];

export const stockInData: StockInItem[] = [];

export const stockOutData: StockOutItem[] = [];

export const suppliersData: SupplierItem[] = [];

export const usersData: UserItem[] = [
  {
    id: "EMP-1001",
    name: "Administrator",
    role: "Administrator",
    department: "IT & Systems",
    email: "admin@bccl.co.in",
    status: "Active",
    lastLogin: "",
  },
];

export const dashboardData = {
  kpiData: {
    totalItems: 0,
    usedItems: 0,
    requiredItems: 0,
    lowStockItems: 0,
    totalValue: 0,
  },
  usageTrendData: [] as { month: string; issued: number; received: number }[],
  categoryData: [] as { name: string; value: number; color: string }[],
  monthlyConsumptionData: [] as { month: string; fuel: number; parts: number; safety: number }[],
  recentActivity: [] as {
    type: string;
    item: string;
    quantity: number;
    dept: string;
    time: string;
    icon: string;
  }[],
};
