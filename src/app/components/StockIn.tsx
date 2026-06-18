import { useEffect, useState } from "react";
import { Plus, Search, Download, CheckCircle2, X, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { getStockInItems, createStockInItem, type StockInItem } from "../lib/appData";
import { ApiError } from "../lib/api";

export function StockIn() {
  const [stockInData, setStockInData] = useState<StockInItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    item: "",
    supplier: "",
    poNumber: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getStockInItems();
        if (active) setStockInData(items);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "Unable to load stock-in records.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = stockInData.filter(i =>
    i.item.toLowerCase().includes(search.toLowerCase()) ||
    i.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    i.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item.trim() || !form.supplier.trim() || !form.quantity) {
      toast.error("Item name, supplier, and quantity are required.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await createStockInItem({
        item: form.item.trim(),
        supplier: form.supplier.trim(),
        poNumber: form.poNumber.trim(),
        quantity: Number(form.quantity),
        date: form.date,
        remarks: form.remarks.trim(),
      });
      setStockInData((current) => [created, ...current]);
      setForm({
        item: "",
        supplier: "",
        poNumber: "",
        quantity: "",
        date: new Date().toISOString().slice(0, 10),
        remarks: "",
      });
      setSuccess(true);
      toast.success("Stock receipt recorded", { description: "Inventory updated and GRN generated." });
      setTimeout(() => { setSuccess(false); setShowForm(false); }, 2200);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to record stock receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading stock-in records...
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
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Stock In</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Record incoming inventory receipts, goods received notes and purchase order fulfilments</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
            <Download className="w-4 h-4" /> Export GRN
          </button>
          <button onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
            <Plus className="w-4 h-4" /> Record Receipt
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Receipts This Month",   val: stockInData.length.toLocaleString(),    sub: "GRN transactions",    color: "#16a34a", bg: "#f0fdf4" },
          { label: "Total Qty Received",    val: stockInData.reduce((s, i) => s + i.quantity, 0).toLocaleString(), sub: "Units received",    color: "#2563eb", bg: "#eff6ff" },
          { label: "Unique Suppliers",      val: new Set(stockInData.map(i => i.supplier)).size.toLocaleString(),     sub: "Vendors in records",   color: "#d97706", bg: "#fffbeb" },
          { label: "Records Shown",         val: filtered.length.toLocaleString(),sub: "Current filter",  color: "#7c3aed", bg: "#f5f3ff" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, letterSpacing: "-0.01em" }}>{s.val}</p>
            <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by item, supplier or PO number..."
            className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        </div>
        <input type="date" className="ims-input px-3 py-2.5 rounded-xl" style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        <input type="date" className="ims-input px-3 py-2.5 rounded-xl" style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> receipts</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} />
            <span style={{ fontSize: "0.68rem", color: "#16a34a", fontWeight: 700 }}>Stock In Records</span>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                {["GRN / Receipt ID","Item Name","Supplier","Qty Received","PO Number","Date Received","Remarks","Verified"].map(h => (
                  <th key={h} className="text-left px-5 py-3"
                    style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td className="px-5 py-4" style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{item.id}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>{item.item}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.78rem", color: "#475569", maxWidth: "180px" }}>
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.supplier}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#f0fdf4" }}>
                        <span style={{ color: "#16a34a", fontSize: "0.7rem" }}>▲</span>
                      </span>
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#16a34a" }}>+{item.quantity.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md" style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.72rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      {item.poNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4" style={{ fontSize: "0.83rem", color: "#475569" }}>{item.date}</td>
                  <td className="px-5 py-4" style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{item.remarks}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1" style={{ color: "#16a34a", fontSize: "0.72rem", fontWeight: 700 }}>
                      <CheckCircle2 style={{ width: "14px", height: "14px" }} /> Verified
                    </span>
                  </td>
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#f0fdf4" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#16a34a" }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem" }}>Receipt Recorded</h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>Inventory has been updated and GRN generated.</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #14532d, #15803d)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                      <PackagePlus className="w-5 h-5" style={{ color: "#fff" }} />
                    </div>
                    <div>
                      <h2 style={{ color: "#fff", fontWeight: 700 }}>Record Stock Receipt</h2>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem" }}>Enter goods received note details</p>
                    </div>
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.6)" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {[
                    { label: "Item Name *",            key: "item",       type: "text",   placeholder: "Search or select item name" },
                    { label: "Supplier Name *",        key: "supplier",   type: "text",   placeholder: "Vendor / supplier company" },
                    { label: "Purchase Order No. *",   key: "poNumber",   type: "text",   placeholder: "e.g. PO-2026-0124" },
                    { label: "Quantity Received *",    key: "quantity",   type: "number", placeholder: "Enter quantity" },
                    { label: "Date of Receipt *",      key: "date",       type: "date",   placeholder: "" },
                    { label: "Remarks / QC Notes",     key: "remarks",    type: "text",   placeholder: "Quality check, condition notes..." },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        className="ims-input w-full px-3 py-2.5 rounded-xl"
                        style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2 justify-end">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px", background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
                      {submitting ? "Saving..." : "Save Receipt"}
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
