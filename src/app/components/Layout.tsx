import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { getSession, signOut } from "../lib/auth";
import {
  LayoutDashboard, Package, PackageMinus, PackageCheck,
  PackagePlus, PackageX, Truck, BarChart3, Users, Settings,
  LogOut, Bell, ChevronDown, Menu, Search, AlertTriangle,
  CheckCircle2, Info, X
} from "lucide-react";

const NAV = [
  { path: "/",              label: "Dashboard",            icon: LayoutDashboard, exact: true },
  { path: "/inventory",     label: "Inventory Management", icon: Package },
  { path: "/used-items",    label: "Used Items",           icon: PackageMinus },
  { path: "/required-items",label: "Required Items",       icon: PackageCheck },
  { path: "/stock-in",      label: "Stock In",             icon: PackagePlus },
  { path: "/stock-out",     label: "Stock Out",            icon: PackageX },
  { path: "/suppliers",     label: "Suppliers",            icon: Truck },
  { path: "/reports",       label: "Reports",              icon: BarChart3 },
  { path: "/users",         label: "Users",                icon: Users },
  { path: "/settings",      label: "Settings",             icon: Settings },
];

const NOTIFS: { type: string; msg: string; sub: string }[] = [];

const NOTIF_STYLE: Record<string, { bg: string; ic: string; ico: any }> = {
  critical: { bg: "#fef2f2", ic: "#dc2626", ico: AlertTriangle },
  warning:  { bg: "#fffbeb", ic: "#d97706", ico: AlertTriangle },
  info:     { bg: "#eff6ff", ic: "#2563eb", ico: Info },
  success:  { bg: "#f0fdf4", ic: "#16a34a", ico: CheckCircle2 },
};

export function Layout() {
  const navigate   = useNavigate();
  const session    = getSession();
  const [collapsed, setCollapsed]   = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [userOpen,  setUserOpen]    = useState(false);

  const close = () => { setNotifOpen(false); setUserOpen(false); };

  const handleSignOut = () => {
    signOut();
    toast.info("Signed out successfully");
    navigate("/login");
  };

  const initials = (session?.name ?? "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="ims-shell flex h-screen overflow-hidden"
      onClick={(e) => { if ((e.target as HTMLElement).closest("[data-dropdown]") === null) close(); }}>

      {/* ── Sidebar ── */}
      <aside
        className="ims-sidebar flex flex-col h-full flex-shrink-0 relative"
        style={{
          width: collapsed ? "68px" : "252px",
          overflow: "hidden",
        }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
          style={{ minHeight: "64px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}>
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
              <path d="M16 3L30 26H2L16 3Z" fill="#0c1a2e" fillOpacity="0.85" />
              <rect x="4" y="26" width="24" height="5" rx="1.5" fill="#0c1a2e" fillOpacity="0.85" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>BCCL</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.6rem", letterSpacing: "0.04em", whiteSpace: "nowrap", textTransform: "uppercase" }}>Inventory System</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mx-3 mt-3 mb-1 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>Financial Year</p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>FY 2026–27</p>
          </div>
        )}

        {/* Nav group label */}
        {!collapsed && (
          <p className="px-5 pt-4 pb-1" style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            Main Navigation
          </p>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
          {NAV.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.exact}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "12px",
                padding: collapsed ? "10px 14px" : "9px 12px",
                borderRadius: "8px",
                position: "relative",
              })}
              className={({ isActive }) => `nav-item ims-nav-link ${isActive ? "ims-nav-link-active" : "ims-nav-link-inactive"}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="sidebar-active-bar" />
                  )}
                  <item.icon style={{ width: "17px", height: "17px", flexShrink: 0, color: isActive ? "#60a5fa" : "rgba(255,255,255,0.45)" }} />
                  {!collapsed && (
                    <>
                      <span style={{ fontSize: "0.83rem", fontWeight: isActive ? 600 : 400, whiteSpace: "nowrap", flex: 1 }}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                          style={{ background: "#dc2626", color: "#fff", fontSize: "0.6rem", fontWeight: 700 }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl p-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full status-online" style={{ background: "#16a34a" }} />
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>System Healthy</span>
            </div>
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>Last sync: Today 09:45 AM</p>
          </div>
        )}

        <div className="px-2 pb-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            className="nav-item flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mt-2"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", justifyContent: collapsed ? "center" : "flex-start" }}
            onClick={handleSignOut}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.12)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
            <LogOut style={{ width: "16px", height: "16px", flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: "0.83rem" }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <header className="ims-topbar flex items-center justify-between px-5 flex-shrink-0"
          style={{ height: "64px" }}>

          <div className="flex items-center gap-4">
            {/* Collapse toggle */}
            <button onClick={() => setCollapsed(!collapsed)}
              className="ims-icon-btn w-9 h-9 rounded-lg flex items-center justify-center">
              <Menu className="w-4 h-4" />
            </button>

            {/* Search bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
              <input placeholder="Search items, transactions, suppliers..."
                className="ims-input pl-9 pr-4 py-2 rounded-xl"
                style={{ width: "300px", background: "#f8fafc", border: "1.5px solid #e2e8f0", fontSize: "0.85rem", color: "#1e293b" }} />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded"
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: "0.65rem", color: "#94a3b8" }}>⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative" data-dropdown>
              <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
                className="ims-icon-btn relative w-9 h-9 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4" />
                {NOTIFS.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "#dc2626", color: "#fff", fontSize: "0.55rem", fontWeight: 800 }}>{NOTIFS.length}</span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  style={{ width: "380px", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>Notifications</p>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem" }}>{NOTIFS.length ? `${NOTIFS.length} unread alerts` : "No alerts"}</p>
                    </div>
                    <button style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "0.72rem", padding: "4px 10px", borderRadius: "6px" }}>
                      Mark all read
                    </button>
                  </div>
                  <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                    {NOTIFS.length === 0 ? (
                      <div className="px-5 py-8 text-center" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        No notifications
                      </div>
                    ) : NOTIFS.map((n, i) => {
                      const cfg = NOTIF_STYLE[n.type];
                      const IconComp = cfg.ico;
                      return (
                        <div key={i} className="flex items-start gap-3 px-5 py-3.5 cursor-pointer"
                          style={{ borderBottom: "1px solid #f8fafc" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                            <IconComp className="w-4 h-4" style={{ color: cfg.ic }} />
                          </div>
                          <div>
                            <p style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 500 }}>{n.msg}</p>
                            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>{n.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-5 py-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <button style={{ width: "100%", padding: "8px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer", fontSize: "0.8rem" }}>
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: "#e2e8f0", margin: "0 4px" }} />

            {/* User avatar */}
            <div className="relative" data-dropdown>
              <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }}>
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>{session?.name ?? "User"}</p>
                  <p style={{ fontSize: "0.65rem", color: "#64748b" }}>{session?.role ?? "Viewer"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "#94a3b8" }} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-12 rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{ width: "220px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <div className="px-4 py-3" style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <p style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem" }}>{session?.name ?? "User"}</p>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{session?.employeeId ?? ""} · {session?.department ?? ""}</p>
                  </div>
                  {["My Profile", "Change Password", "Preferences", "Audit Log"].map((item) => (
                    <button key={item} className="w-full text-left px-4 py-2.5 nav-item"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", fontSize: "0.83rem" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                      {item}
                    </button>
                  ))}
                  <div style={{ borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "0.83rem" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: "var(--surface)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
