import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Shield, Key, UserCheck, X } from "lucide-react";
import { getUsers, type UserItem } from "../lib/appData";

const ROLE_CFG: Record<string, { bg: string; color: string; border: string }> = {
  Administrator:      { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "Inventory Manager":{ bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  "Store Officer":    { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  "Store Keeper":     { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Viewer:             { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

const PERMS = [
  { perm: "View Inventory",   vals: [true,true,true,true,true]  },
  { perm: "Add / Edit Items", vals: [true,true,true,false,false] },
  { perm: "Delete Items",     vals: [true,true,false,false,false]},
  { perm: "Stock In / Out",   vals: [true,true,true,true,false] },
  { perm: "Manage Suppliers", vals: [true,true,false,false,false]},
  { perm: "Generate Reports", vals: [true,true,true,false,false] },
  { perm: "Manage Users",     vals: [true,false,false,false,false]},
  { perm: "System Settings",  vals: [true,false,false,false,false]},
];

export function Users() {
  const [usersData, setUsersData] = useState<UserItem[]>([]);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getUsers();
        if (active) setUsersData(items);
      } catch {
        if (active) setError("Unable to load user records.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = usersData.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    const matchR  = role === "All" || u.role === role;
    return matchQ && matchR;
  });

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>User Management</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>System users, role assignments and access permissions</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(ROLE_CFG).map(([r, cfg]) => {
          const count = usersData.filter(u => u.role === r).length;
          return (
            <button key={r} onClick={() => setRole(role === r ? "All" : r)}
              className="rounded-2xl p-4 text-center card-elevated"
              style={{ background: "#fff", border: `2px solid ${role === r ? cfg.color : "#e2e8f0"}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2.5" style={{ background: cfg.bg }}>
                <Shield style={{ width: "16px", height: "16px", color: cfg.color }} />
              </div>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</p>
              <p style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "4px", lineHeight: 1.3 }}>{r}</p>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID or department..."
            className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        </div>
        <div className="flex gap-2">
          {["All", ...Object.keys(ROLE_CFG)].map(r => {
            const cfg = ROLE_CFG[r];
            const isActive = role === r;
            return (
              <button key={r} onClick={() => setRole(isActive && r !== "All" ? "All" : r)}
                style={{
                  padding: "8px 14px", borderRadius: "10px", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap",
                  background: isActive ? (cfg?.color ?? "#1d4ed8") : "#f8fafc",
                  color: isActive ? "#fff" : "#475569",
                  border: `1px solid ${isActive ? (cfg?.color ?? "#1d4ed8") : "#e2e8f0"}`,
                  fontWeight: isActive ? 700 : 400,
                }}>{r}</button>
            );
          })}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                {["Employee","Employee ID","Role","Department","Email","Status","Last Login","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3"
                    style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const init = user.name.split(" ").map(n => n[0]).slice(0,2).join("");
                const cfg  = ROLE_CFG[user.role] ?? { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
                const colors = ["#1d4ed8","#7c3aed","#059669","#d97706","#dc2626"];
                const avatarColor = colors[i % colors.length];
                return (
                  <tr key={user.id} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: avatarColor, color: "#fff", fontWeight: 700, fontSize: "0.72rem" }}>{init}</div>
                        <div>
                          <p style={{ fontSize: "0.83rem", color: "#0f172a", fontWeight: 600 }}>{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{user.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: "0.68rem", fontWeight: 700 }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.83rem", color: "#475569" }}>{user.department}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.78rem", color: "#2563eb" }}>{user.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: user.status === "Active" ? "#f0fdf4" : "#f8fafc", color: user.status === "Active" ? "#16a34a" : "#94a3b8", fontSize: "0.68rem", fontWeight: 700 }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: user.status === "Active" ? "#16a34a" : "#94a3b8" }} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{user.lastLogin}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff", border: "none", cursor: "pointer" }} title="Edit">
                          <Edit2 style={{ width: "13px", height: "13px", color: "#2563eb" }} />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fffbeb", border: "none", cursor: "pointer" }} title="Reset Password">
                          <Key style={{ width: "13px", height: "13px", color: "#d97706" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.92rem" }}>Role Permissions Matrix</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Access control per module</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                <th className="text-left px-5 py-3" style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: "160px" }}>Module / Permission</th>
                {Object.entries(ROLE_CFG).map(([r, cfg]) => (
                  <th key={r} className="px-4 py-3 text-center" style={{ fontSize: "0.65rem", color: cfg.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMS.map(row => (
                <tr key={row.perm} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td className="px-5 py-3" style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{row.perm}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {v ? (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: "#f0fdf4" }}>
                          <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 800 }}>✓</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: "#f8fafc" }}>
                          <span style={{ color: "#e2e8f0", fontSize: "0.75rem" }}>—</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#fff" }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)" }}>
              <h2 style={{ color: "#fff", fontWeight: 700 }}>Create New User Account</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.6)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {["Full Name *","Employee ID *","Email Address *","Department *"].map(f => (
                <div key={f}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f}</label>
                  <input placeholder={`Enter ${f.replace(" *","").toLowerCase()}`} className="ims-input w-full px-3 py-2.5 rounded-xl"
                    style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Assign Role *</label>
                <select className="ims-input w-full px-3 py-2.5 rounded-xl" style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }}>
                  {Object.keys(ROLE_CFG).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 justify-end" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <button onClick={() => setShowAdd(false)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
              <button onClick={() => setShowAdd(false)} className="btn-primary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
