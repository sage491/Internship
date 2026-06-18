import { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit2, Phone, Mail, MapPin, Star, X, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { getSuppliers, createSupplier, type SupplierItem } from "../lib/appData";
import { ApiError } from "../lib/api";

export function Suppliers() {
  const [suppliersData, setSuppliersData] = useState<SupplierItem[]>([]);
  const [search,  setSearch]  = useState("");
  const [view,    setView]    = useState<"table"|"card">("table");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const items = await getSuppliers();
        if (active) setSuppliersData(items);
      } catch (err) {
        if (active) setError(err instanceof ApiError ? err.message : "Unable to load suppliers.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = suppliersData.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveSupplier = async () => {
    if (!form.name.trim() || !form.contact.trim()) {
      toast.error("Company name and contact person are required.");
      return;
    }

    try {
      setSaving(true);
      const created = await createSupplier({
        name: form.name.trim(),
        contact: form.contact.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        status: "Active",
      });
      setSuppliersData((current) => [created, ...current]);
      setForm({ name: "", contact: "", phone: "", email: "", address: "" });
      setShowAdd(false);
      toast.success("Supplier added successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading suppliers...
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
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Supplier Management</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Vendor directory, contacts and performance ratings</p>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            {([["table", List], ["card", LayoutGrid]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: view === v ? "#1d4ed8" : "#fff", border: "none", cursor: "pointer" }}>
                <Icon style={{ width: "16px", height: "16px", color: view === v ? "#fff" : "#64748b" }} />
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Suppliers",    val: suppliersData.length,                            color: "#2563eb", bg: "#eff6ff" },
          { label: "Active Vendors",     val: suppliersData.filter(s=>s.status==="Active").length, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Inactive / Blocked", val: suppliersData.filter(s=>s.status!=="Active").length, color: "#94a3b8", bg: "#f8fafc" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 card-elevated flex items-center gap-4" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</span>
            </div>
            <p style={{ fontSize: "0.83rem", color: "#475569" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by supplier name, ID or contact person..."
            className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
        </div>
      </div>

      {view === "table" ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                  {["Supplier ID","Company Name","Contact Person","Phone","Email","City / Address","Rating","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3"
                      style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td className="px-5 py-4" style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.id}</td>
                    <td className="px-5 py-4">
                      <p style={{ fontSize: "0.83rem", color: "#0f172a", fontWeight: 600, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</p>
                    </td>
                    <td className="px-5 py-4" style={{ fontSize: "0.83rem", color: "#475569" }}>{s.contact}</td>
                    <td className="px-5 py-4" style={{ fontSize: "0.78rem", color: "#475569" }}>{s.phone}</td>
                    <td className="px-5 py-4" style={{ fontSize: "0.78rem", color: "#2563eb" }}>{s.email}</td>
                    <td className="px-5 py-4" style={{ fontSize: "0.75rem", color: "#64748b", maxWidth: "160px" }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.address}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => <Star key={n} style={{ width: "12px", height: "12px", fill: n <= 4 ? "#f59e0b" : "#e2e8f0", color: n <= 4 ? "#f59e0b" : "#e2e8f0" }} />)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{
                          background: s.status === "Active" ? "#f0fdf4" : "#f8fafc",
                          color:      s.status === "Active" ? "#16a34a" : "#94a3b8",
                          fontSize: "0.68rem", fontWeight: 700,
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.status === "Active" ? "#16a34a" : "#94a3b8" }} />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff", border: "none", cursor: "pointer" }}>
                          <Eye style={{ width: "13px", height: "13px", color: "#2563eb" }} />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f0fdf4", border: "none", cursor: "pointer" }}>
                          <Edit2 style={{ width: "13px", height: "13px", color: "#16a34a" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
                    <span style={{ color: "#2563eb", fontWeight: 800, fontSize: "0.8rem" }}>{s.id.replace("SUP-","")}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "2px" }}>{s.id}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <Star key={n} style={{ width: "11px", height: "11px", fill: n <= 4 ? "#f59e0b" : "#e2e8f0", color: n <= 4 ? "#f59e0b" : "#e2e8f0" }} />)}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: s.status === "Active" ? "#f0fdf4" : "#f8fafc", color: s.status === "Active" ? "#16a34a" : "#94a3b8", fontSize: "0.68rem", fontWeight: 700 }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.status === "Active" ? "#16a34a" : "#94a3b8" }} />
                  {s.status}
                </span>
              </div>
              <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.88rem", marginBottom: "4px", lineHeight: 1.4 }}>{s.name}</h3>
              <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "12px" }}>Contact: <strong style={{ color: "#374151" }}>{s.contact}</strong></p>
              <div className="space-y-2 pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                {[
                  { Icon: Phone, val: s.phone, color: "#94a3b8" },
                  { Icon: Mail,  val: s.email, color: "#2563eb" },
                  { Icon: MapPin,val: s.address, color: "#94a3b8" },
                ].map(({ Icon, val, color }) => (
                  <div key={val} className="flex items-start gap-2">
                    <Icon style={{ width: "13px", height: "13px", color: "#cbd5e1", marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.75rem", color: color === "#2563eb" ? "#2563eb" : "#64748b" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: "#fff" }}>
            <div className="px-6 py-5 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)" }}>
              <h2 style={{ color: "#fff", fontWeight: 700 }}>Add New Supplier</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.6)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { l: "Company Name *", key: "name" }, { l: "Contact Person *", key: "contact" },
                { l: "Phone Number *", key: "phone" },  { l: "Email Address *", key: "email" },
                { l: "Full Address", key: "address", s: 2 },
              ].map(f => (
                <div key={f.l} className={f.s === 2 ? "col-span-2" : ""}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.l}</label>
                  <input
                    placeholder={`Enter ${f.l.replace(" *","").toLowerCase()}`}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="ims-input w-full px-3 py-2.5 rounded-xl"
                    style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 py-4 justify-end" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <button onClick={() => setShowAdd(false)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
              <button onClick={handleSaveSupplier} disabled={saving} className="btn-primary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
                {saving ? "Saving..." : "Save Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
