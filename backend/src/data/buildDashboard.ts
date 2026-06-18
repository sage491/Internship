import type { InventoryItem, RequiredItem, StockInItem, StockOutItem, UsedItem } from "../types.js";

const CATEGORY_COLORS = ["#2563eb", "#0891b2", "#7c3aed", "#059669", "#d97706", "#dc2626", "#64748b"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "" : MONTHS[d.getMonth()] ?? "";
}

function lastSixMonths(): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(MONTHS[d.getMonth()]);
  }
  return labels;
}

export type DashboardPayload = {
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
  recentActivity: {
    type: "issued" | "received" | "alert";
    item: string;
    quantity: number;
    dept: string;
    time: string;
    icon: "in" | "out" | "alert";
  }[];
};

export function buildDashboardData(
  inventory: InventoryItem[],
  used: UsedItem[],
  required: RequiredItem[],
  stockIn: StockInItem[],
  stockOut: StockOutItem[],
): DashboardPayload {
  const kpiData = {
    totalItems: inventory.length,
    usedItems: used.reduce((sum, row) => sum + row.quantity, 0),
    requiredItems: required.filter((row) => row.deficit > 0).length,
    lowStockItems: inventory.filter((row) => row.status === "Low Stock" || row.status === "Out of Stock").length,
    totalValue: inventory.reduce((sum, row) => sum + row.quantity, 0),
  };

  const months = lastSixMonths();
  const issuedByMonth = Object.fromEntries(months.map((m) => [m, 0]));
  const receivedByMonth = Object.fromEntries(months.map((m) => [m, 0]));

  for (const row of stockOut) {
    const m = monthLabel(row.date);
    if (m in issuedByMonth) issuedByMonth[m] += row.quantity;
  }
  for (const row of stockIn) {
    const m = monthLabel(row.date);
    if (m in receivedByMonth) receivedByMonth[m] += row.quantity;
  }

  const usageTrendData = months.map((month) => ({
    month,
    issued: issuedByMonth[month] ?? 0,
    received: receivedByMonth[month] ?? 0,
  }));

  const categoryCounts = new Map<string, number>();
  for (const item of inventory) {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
  }
  const categoryTotal = inventory.length || 1;
  const categoryData = [...categoryCounts.entries()].map(([name, count], index) => ({
    name,
    value: Math.round((count / categoryTotal) * 100),
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const consumptionByMonth = Object.fromEntries(
    months.map((m) => [m, { month: m, fuel: 0, parts: 0, safety: 0 }]),
  );

  for (const row of stockOut) {
    const m = monthLabel(row.date);
    if (!(m in consumptionByMonth)) continue;
    const inv = inventory.find((i) => i.name === row.item);
    const cat = inv?.category ?? "";
    if (cat === "Fuel" || cat === "Lubricants") consumptionByMonth[m].fuel += row.quantity;
    else if (cat === "Machinery Parts" || cat === "Mining Tools") consumptionByMonth[m].parts += row.quantity;
    else if (cat === "Safety Equipment") consumptionByMonth[m].safety += row.quantity;
  }

  const monthlyConsumptionData = months.map((m) => consumptionByMonth[m]);

  const recentActivity: DashboardPayload["recentActivity"] = [];

  for (const row of stockOut.slice(0, 5)) {
    recentActivity.push({
      type: "issued",
      item: row.item,
      quantity: row.quantity,
      dept: row.department,
      time: row.date,
      icon: "out",
    });
  }
  for (const row of stockIn.slice(0, 5)) {
    recentActivity.push({
      type: "received",
      item: row.item,
      quantity: row.quantity,
      dept: row.supplier,
      time: row.date,
      icon: "in",
    });
  }
  for (const item of inventory.filter((row) => row.status === "Out of Stock" || row.status === "Low Stock").slice(0, 5)) {
    recentActivity.push({
      type: "alert",
      item: item.name,
      quantity: item.quantity,
      dept: item.location,
      time: item.lastUpdated,
      icon: "alert",
    });
  }

  recentActivity.sort((a, b) => b.time.localeCompare(a.time));

  return {
    kpiData,
    usageTrendData,
    categoryData,
    monthlyConsumptionData,
    recentActivity: recentActivity.slice(0, 10),
  };
}

export const emptyDashboard = buildDashboardData([], [], [], [], []);
