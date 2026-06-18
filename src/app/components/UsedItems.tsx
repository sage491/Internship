import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import { getUsedItems, type UsedItem } from "../lib/appData";

const DEPTS = ["All Departments","Underground Mining","Drilling Section","Transport","Maintenance","Mechanical","Surface Mining"];

export function UsedItems() {
  const [usedItemsData, setUsedItemsData] = useState<UsedItem[]>([]);
  const [search, setSearch] = useState("");
  const [dept,   setDept]   = useState("All Departments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getUsedItems();
        if (active) setUsedItemsData(items);
      } catch {
        if (active) setError("Unable to load used items.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = usedItemsData.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.item.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.issuedBy.toLowerCase().includes(q)) &&
      (dept === "All Departments" || item.department === dept)
    );
  });

  const totalTransactions = usedItemsData.length;
  const totalQtyConsumed = usedItemsData.reduce((sum, item) => sum + item.quantity, 0);
  const departmentsServed = new Set(usedItemsData.map((item) => item.department)).size;

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading used items...
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
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Used Items</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Audit trail of all issued and consumed inventory across departments</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Transactions", val: totalTransactions.toLocaleString(), color: "#2563eb", bg: "#eff6ff" },
          { label: "Total Qty Consumed", val: totalQtyConsumed.toLocaleString(), color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Departments Served", val: departmentsServed.toLocaleString(), color: "#059669", bg: "#f0fdf4" },
          { label: "Records Shown", val: filtered.length.toLocaleString(), color: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, letterSpacing: "-0.01em" }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4 flex flex-wrap gap-3" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by transaction ID, item or employee..."
            className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} className="ims-input px-3 py-2.5 rounded-xl"
          style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc", minWidth: "190px" }}>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <input type="date" className="ims-input px-3 py-2.5 rounded-xl"
          style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        <input type="date" className="ims-input px-3 py-2.5 rounded-xl"
          style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
      </div>

      {/* Department quick-filter pills */}
      <div className="flex flex-wrap gap-2">
        {DEPTS.map(d => (
          <button key={d} onClick={() => setDept(d)}
            style={{
              padding: "6px 14px", borderRadius: "999px", fontSize: "0.75rem", cursor: "pointer",
              background: dept === d ? "#1d4ed8" : "#f8fafc",
              color: dept === d ? "#fff" : "#475569",
              border: `1px solid ${dept === d ? "#1d4ed8" : "#e2e8f0"}`,
              fontWeight: dept === d ? 700 : 400,
            }}>{d}</button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of {usedItemsData.length} transactions
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                {["Transaction ID","Item Name","Qty Used","Department","Issued By","Issue Date","Remarks"].map(h => (
                  <th key={h} className="text-left px-5 py-3"
                    style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    No used item records yet
                  </td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td className="px-5 py-4" style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{item.id}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>{item.item}</td>
                  <td className="px-5 py-4">
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#7c3aed" }}>{item.quantity.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full" style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.72rem", fontWeight: 600 }}>
                      {item.department}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: "0.83rem", color: "#475569" }}>{item.issuedBy}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.83rem", color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{item.date}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{item.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{filtered.length} record(s)</span>
        </div>
        )}
      </div>
    </div>
  );
}
