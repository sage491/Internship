import { useEffect, useState } from "react";
import { AlertTriangle, Search, Download, ShoppingCart, X, CheckCircle2 } from "lucide-react";
import { getRequiredItems, type RequiredItem } from "../lib/appData";

const PRIORITY_CFG: Record<string, { bg: string; color: string; border: string }> = {
  Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  High:     { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  Medium:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  Low:      { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_CFG[priority] ?? { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.04em" }}>
      {(priority === "Critical" || priority === "High") && <AlertTriangle style={{ width: "10px", height: "10px" }} />}
      {priority}
    </span>
  );
}

export function RequiredItems() {
  const [requiredItemsData, setRequiredItemsData] = useState<RequiredItem[]>([]);
  const [search,   setSearch]   = useState("");
  const [priority, setPriority] = useState("All");
  const [showPO,   setShowPO]   = useState(false);
  const [raised,   setRaised]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getRequiredItems();
        if (active) setRequiredItemsData(items);
      } catch {
        if (active) setError("Unable to load required items.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const critical = requiredItemsData.filter(i => (i.priority === "Critical" || i.priority === "High") && i.deficit > 0);
  const filtered = requiredItemsData.filter(i => {
    const mq = i.item.toLowerCase().includes(search.toLowerCase());
    const mp = priority === "All" || i.priority === priority;
    return mq && mp;
  });

  const handleRaise = () => {
    setRaised(true);
    setTimeout(() => { setRaised(false); setShowPO(false); }, 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading required items...
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
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Required Items</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Auto-generated procurement list · Items below minimum stock threshold</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowPO(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
            <ShoppingCart className="w-4 h-4" /> Raise Indent
          </button>
        </div>
      </div>

      {/* Critical banner */}
      {critical.length > 0 && (
        <div className="rounded-2xl px-5 py-4" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #dc2626" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 pulse-critical" style={{ color: "#f87171" }} />
            <span style={{ fontWeight: 700, color: "#f87171", fontSize: "0.85rem" }}>
              CRITICAL: {critical.length} item(s) require immediate procurement
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {critical.map(item => (
              <div key={item.item} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)" }}>
                <span style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 500 }}>{item.item}</span>
                <span style={{ fontSize: "0.72rem", color: "#f87171", fontWeight: 700 }}>−{item.deficit} {item.item.includes("Liter") ? "L" : "Nos"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Critical",       priority: "Critical", icon: "🔴" },
          { label: "High Priority",  priority: "High",     icon: "🟠" },
          { label: "Medium Priority",priority: "Medium",   icon: "🔵" },
          { label: "Low / Adequate", priority: "Low",      icon: "🟢" },
        ].map(s => {
          const cfg = PRIORITY_CFG[s.priority];
          const count = requiredItemsData.filter(i => i.priority === s.priority).length;
          const isActive = priority === s.priority;
          return (
            <button key={s.label} onClick={() => setPriority(isActive ? "All" : s.priority)}
              className="rounded-2xl p-5 text-left card-elevated"
              style={{
                background: "#fff",
                border: `2px solid ${isActive ? cfg.color : "#e2e8f0"}`,
                cursor: "pointer", transition: "all 0.15s",
              }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{s.icon}</div>
              <p style={{ fontSize: "1.75rem", fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>{s.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4 flex gap-3 items-center" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item name..."
            className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        </div>
        <div className="flex gap-2">
          {["All", "Critical", "High", "Medium", "Low"].map(p => (
            <button key={p} onClick={() => setPriority(p)}
              style={{
                padding: "8px 14px", borderRadius: "10px", fontSize: "0.78rem", cursor: "pointer",
                background: priority === p ? "#1d4ed8" : "#f8fafc",
                color: priority === p ? "#fff" : "#475569",
                border: `1px solid ${priority === p ? "#1d4ed8" : "#e2e8f0"}`,
                fontWeight: priority === p ? 700 : 400,
              }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                {["Item Name","Current Stock","Min Required","Deficit Qty","Stock %","Priority","Procurement Status","Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3"
                    style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const pct = item.required > 0 ? Math.min(100, Math.round((item.current / item.required) * 100)) : 100;
                return (
                  <tr key={item.item} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td className="px-5 py-4" style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600, maxWidth: "220px" }}>
                      {item.item}
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: item.current < item.required ? "#dc2626" : "#16a34a" }}>
                        {item.current.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4" style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>{item.required.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span style={{ fontSize: "0.95rem", fontWeight: 800, color: item.deficit > 0 ? "#dc2626" : "#16a34a" }}>
                        {item.deficit > 0 ? `−${item.deficit}` : "✓"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full flex-1" style={{ width: "60px", background: "#f1f5f9" }}>
                          <div className="h-2 rounded-full" style={{
                            width: `${pct}%`,
                            background: pct < 50 ? "#dc2626" : pct < 100 ? "#d97706" : "#16a34a",
                          }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", minWidth: "32px" }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><PriorityBadge priority={item.priority} /></td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full"
                        style={{
                          background: item.status === "Adequate" ? "#f0fdf4" : item.status.includes("PO") ? "#eff6ff" : "#fffbeb",
                          color:      item.status === "Adequate" ? "#16a34a" : item.status.includes("PO") ? "#2563eb" : "#d97706",
                          fontSize: "0.72rem", fontWeight: 600,
                        }}>{item.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {item.deficit > 0 && (
                        <button onClick={() => setShowPO(true)}
                          className="btn-primary px-3 py-1.5 rounded-lg"
                          style={{ fontSize: "0.72rem", borderRadius: "8px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
                          Raise PO
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Modal */}
      {showPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ background: "#fff" }}>
            {raised ? (
              <div className="flex flex-col items-center py-14 px-8">
                <CheckCircle2 className="w-14 h-14 mb-4" style={{ color: "#16a34a" }} />
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem" }}>Indent Raised Successfully</h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>Purchase requisition has been submitted to the procurement department.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)" }}>
                  <div className="flex items-center justify-between">
                    <h2 style={{ color: "#fff", fontWeight: 700 }}>Raise Purchase Indent</h2>
                    <button onClick={() => setShowPO(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.6)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {["Item Name","Required Quantity","Preferred Supplier","Expected Delivery Date","Budget Code","Remarks"].map(f => (
                    <div key={f}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f}</label>
                      <input placeholder={`Enter ${f.toLowerCase()}`} className="ims-input w-full px-3 py-2.5 rounded-xl"
                        style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 px-6 py-4 justify-end" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                  <button onClick={() => setShowPO(false)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
                  <button onClick={handleRaise} className="btn-primary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>Submit Indent</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
