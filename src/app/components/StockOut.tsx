import { useEffect, useState } from "react";
import { Plus, Search, Download, CheckCircle2, X, PackageX } from "lucide-react";
import { toast } from "sonner";
import { getStockOutItems, createStockOutItem, type StockOutItem } from "../lib/appData";
import { ApiError } from "../lib/api";

const DEPTS = ["Underground Mining","Drilling Section","Transport","Maintenance","Mechanical","Surface Mining","Finance","Administration","HR","Safety"];

export function StockOut() {
  const [stockOutData, setStockOutData] = useState<StockOutItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState("");
  const [dept,     setDept]     = useState("All");
  const [success,  setSuccess]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    item: "",
    quantity: "",
    department: DEPTS[0],
    employee: "",
    date: new Date().toISOString().slice(0, 10),
    purpose: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getStockOutItems();
        if (active) setStockOutData(items);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "Unable to load stock-out records.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = stockOutData.filter(i => {
    const q = search.toLowerCase();
    return (
      (i.item.toLowerCase().includes(q) || i.department.toLowerCase().includes(q) || i.employee.toLowerCase().includes(q)) &&
      (dept === "All" || i.department === dept)
    );
  });

  const issuesCount = stockOutData.length;
  const totalQtyIssued = stockOutData.reduce((sum, item) => sum + item.quantity, 0);
  const departmentsServed = new Set(stockOutData.map((item) => item.department)).size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item.trim() || !form.employee.trim() || !form.quantity) {
      toast.error("Item name, employee, and quantity are required.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await createStockOutItem({
        item: form.item.trim(),
        quantity: Number(form.quantity),
        department: form.department,
        employee: form.employee.trim(),
        date: form.date,
        purpose: form.purpose.trim(),
      });
      setStockOutData((current) => [created, ...current]);
      setForm({
        item: "",
        quantity: "",
        department: DEPTS[0],
        employee: "",
        date: new Date().toISOString().slice(0, 10),
        purpose: "",
      });
      setSuccess(true);
      toast.success("Items issued successfully", { description: "Stock out recorded and inventory updated." });
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 2200);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to record stock issue.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading stock-out records...
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
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Stock Out</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Record inventory issues, material requisitions and departmental consumption</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}>
            <Plus className="w-4 h-4" /> Issue Items
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Issue Records", val: issuesCount.toLocaleString(), sub: "Stock out transactions", color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Total Qty Issued", val: totalQtyIssued.toLocaleString(), sub: "Units issued", color: "#dc2626", bg: "#fef2f2" },
          { label: "Departments Served", val: departmentsServed.toLocaleString(), sub: "Active consumers", color: "#2563eb", bg: "#eff6ff" },
          { label: "Records Shown", val: filtered.length.toLocaleString(), sub: "Current filter", color: "#d97706", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, letterSpacing: "-0.01em" }}>{s.val}</p>
            <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="rounded-2xl p-4 flex flex-wrap gap-3" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by item, department or employee..."
            className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} className="ims-input px-3 py-2.5 rounded-xl"
          style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc", minWidth: "180px" }}>
          <option value="All">All Departments</option>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <input type="date" className="ims-input px-3 py-2.5 rounded-xl" style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> issue records</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#dc2626" }} />
            <span style={{ fontSize: "0.68rem", color: "#dc2626", fontWeight: 700 }}>Stock Out Records</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                {["Issue ID","Item Name","Qty Issued","Department","Employee / ID","Issue Date","Purpose"].map(h => (
                  <th key={h} className="text-left px-5 py-3"
                    style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    No stock out records yet
                  </td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td className="px-5 py-4" style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{item.id}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>{item.item}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#fef2f2" }}>
                        <span style={{ color: "#dc2626", fontSize: "0.7rem" }}>▼</span>
                      </span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#dc2626" }}>−{item.quantity.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full" style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: "0.72rem", fontWeight: 600 }}>
                      {item.department}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: "0.83rem", color: "#475569" }}>{item.employee}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.83rem", color: "#475569" }}>{item.date}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#fff" }}>
            {success ? (
              <div className="flex flex-col items-center py-16 px-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#f5f3ff" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#7c3aed" }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem" }}>Issue Recorded</h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>Stock has been issued and inventory updated successfully.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #3b0764, #6d28d9)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <PackageX className="w-5 h-5" style={{ color: "#fff" }} />
                    </div>
                    <div>
                      <h2 style={{ color: "#fff", fontWeight: 700 }}>Issue Inventory Items</h2>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem" }}>Material requisition / issue slip</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.6)" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {[
                    { label: "Item Name *",        key: "item",       type: "text",   placeholder: "Search or select item name" },
                    { label: "Quantity to Issue *", key: "quantity",   type: "number", placeholder: "Enter quantity" },
                    { label: "Department *",        key: "department", type: "select" },
                    { label: "Employee Name & ID *",key: "employee",   type: "text",   placeholder: "e.g. R.K. Sharma (EMP-1045)" },
                    { label: "Issue Date *",        key: "date",       type: "date",   placeholder: "" },
                    { label: "Purpose / Remarks",   key: "purpose",    type: "text",   placeholder: "Purpose of issue or work order reference..." },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                      {f.type === "select" ? (
                        <select
                          value={form.department}
                          onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                          className="ims-input w-full px-3 py-2.5 rounded-xl" style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }}>
                          {DEPTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={form[f.key as keyof typeof form]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                          className="ims-input w-full px-3 py-2.5 rounded-xl"
                          style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2 justify-end">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px", background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}>
                      {submitting ? "Saving..." : "Confirm Issue"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
