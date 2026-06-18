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
