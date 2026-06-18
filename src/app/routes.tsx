import { createBrowserRouter, redirect } from "react-router";
import { LoginPage } from "./components/LoginPage";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { InventoryManagement } from "./components/InventoryManagement";
import { UsedItems } from "./components/UsedItems";
import { RequiredItems } from "./components/RequiredItems";
import { StockIn } from "./components/StockIn";
import { StockOut } from "./components/StockOut";
import { Suppliers } from "./components/Suppliers";
import { Reports } from "./components/Reports";
import { Users } from "./components/Users";
import { Settings } from "./components/Settings";
import { isAuthenticated } from "./lib/auth";

function requireAuth() {
  if (!isAuthenticated()) {
    throw redirect("/login");
  }
  return null;
}

function guestOnly() {
  if (isAuthenticated()) {
    throw redirect("/");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    loader: guestOnly,
    Component: LoginPage,
  },
  {
    path: "/",
    loader: requireAuth,
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "dashboard", Component: Dashboard },
      { path: "inventory", Component: InventoryManagement },
      { path: "used-items", Component: UsedItems },
      { path: "required-items", Component: RequiredItems },
      { path: "stock-in", Component: StockIn },
      { path: "stock-out", Component: StockOut },
      { path: "suppliers", Component: Suppliers },
      { path: "reports", Component: Reports },
      { path: "users", Component: Users },
      { path: "settings", Component: Settings },
    ],
  },
]);
