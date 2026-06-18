import { useEffect, useMemo, useState, Fragment } from "react";
import {
  Search, Filter, Download, Plus, Eye, Edit2, Trash2,
  ChevronUp, ChevronDown, X, Package, CheckCircle2,
  ChevronRight, MapPin, Tag, AlertTriangle
} from "lucide-react";
import { getInventoryItems, removeInventoryItem, type InventoryItem } from "../lib/appData";
import { toast } from "sonner";

const CATEGORIES = ["All Categories","Safety Equipment","Mining Tools","Machinery Parts","Fuel","Explosives","Lubricants","Consumables"];
const STATUSES   = ["All Status","In Stock","Low Stock","Out of Stock"];
type SortKey = "id"|"name"|"quantity"|"lastUpdated";
type SortDir = "asc"|"desc";

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { bg: string; color: string; dot: string }> = {
    "In Stock":     { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
    "Low Stock":    { bg: "#fffbeb", color: "#d97706", dot: "#d97706" },
    "Out of Stock": { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  };
  const c = m[status] ?? { bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color, fontSize: "0.68rem", fontWeight: 700 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function SortBtn({ col, sortKey, dir, onClick }: { col: SortKey; sortKey: SortKey; dir: SortDir; onClick: () => void }) {
  const active = sortKey === col;
  return (
    <button onClick={onClick} className="inline-flex items-center gap-0.5 group" style={{ background: "none", border: "none", cursor: "pointer" }}>
      <span style={{ fontSize: "0.68rem", color: active ? "#2563eb" : "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {col === "id" ? "Item ID" : col === "name" ? "Item Name" : col === "quantity" ? "Qty Available" : "Last Updated"}
      </span>
      <span className="flex flex-col" style={{ marginLeft: "3px" }}>
        <ChevronUp  style={{ width: "9px", height: "9px", color: active && dir === "asc"  ? "#2563eb" : "#cbd5e1" }} />
        <ChevronDown style={{ width: "9px", height: "9px", color: active && dir === "desc" ? "#2563eb" : "#cbd5e1", marginTop: "-2px" }} />
      </span>
    </button>
  );
}

export function InventoryManagement() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All Categories");
  const [status,    setStatus]    = useState("All Status");
  const [showAdd,   setShowAdd]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [sortKey,   setSortKey]   = useState<SortKey>("id");
  const [sortDir,   setSortDir]   = useState<SortDir>("asc");
  const [expandedId,setExpanded]  = useState<string | null>(null);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    const loadInventory = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const items = await getInventoryItems();
        if (active) setInventoryItems(items);
      } catch {
        if (active) setLoadError("Unable to load inventory data right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInventory();

    return () => {
      active = false;
    };
  }, []);

  const toggleSort = (col: SortKey) => {
    if (sortKey === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(col); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventoryItems
      .filter(item =>
        (item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) &&
        (category === "All Categories" || item.category === category) &&
        (status   === "All Status"     || item.status   === status)
      )
      .sort((a, b) => {
        let av: string | number = "", bv: string | number = "";
        if (sortKey === "id")          { av = a.id;       bv = b.id; }
        if (sortKey === "name")        { av = a.name;     bv = b.name; }
        if (sortKey === "quantity")    { av = a.quantity; bv = b.quantity; }
        if (sortKey === "lastUpdated") { av = a.lastUpdated; bv = b.lastUpdated; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, category, status, sortKey, sortDir]);

  const allSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id));
  const toggleAll   = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(i => i.id)));
  };
  const toggleOne   = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteId(null);
    try {
      await removeInventoryItem(id);
      setInventoryItems((current) => current.filter((item) => item.id !== id));
      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      toast.success(`"${name}" removed from inventory`, { description: "Item has been archived." });
    } catch {
      toast.error("Failed to remove inventory item");
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowAdd(false); }, 2000);
    toast.success("New inventory item added successfully");
  };

  const handleExport = () => toast.success("Excel export started", { description: "Your file will be ready in a moment." });

  const counts = {
    in:  inventoryItems.filter(i => i.status === "In Stock").length,
    low: inventoryItems.filter(i => i.status === "Low Stock").length,
    out: inventoryItems.filter(i => i.status === "Out of Stock").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading inventory data...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Inventory Management</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Click rows to expand · Sort columns · Select for bulk actions</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <span style={{ fontSize: "0.8rem", color: "#1d4ed8", fontWeight: 600 }}>{selected.size} selected</span>
              <button onClick={() => { toast.error(`${selected.size} items deleted`); setSelected(new Set()); }}
                style={{ background: "#dc2626", border: "none", color: "#fff", borderRadius: "6px", padding: "2px 8px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600 }}>
                Delete
              </button>
              <button onClick={() => setSelected(new Set())} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "All Items",     val: inventoryItems.length, statusVal: "All Status",     color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "In Stock",      val: counts.in,             statusVal: "In Stock",        color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Low Stock",     val: counts.low,            statusVal: "Low Stock",       color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
          { label: "Out of Stock",  val: counts.out,            statusVal: "Out of Stock",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
        ].map((c) => (
          <button key={c.label} onClick={() => setStatus(c.statusVal)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 14px", borderRadius: "999px",
              background: status === c.statusVal ? c.bg : "#fff",
              border: `1.5px solid ${status === c.statusVal ? c.color : "#e2e8f0"}`,
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: status === c.statusVal ? `0 2px 8px ${c.color}20` : "none",
            }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: c.color }}>{c.val}</span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.label}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Showing <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> of {inventoryItems.length}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by Item ID or Name..."
              className="ims-input w-full pl-10 pr-4 py-2.5 rounded-xl"
              style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="ims-input px-3 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc", minWidth: "175px" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="ims-input px-3 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc", minWidth: "145px" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          {(search || category !== "All Categories" || status !== "All Status") && (
            <button onClick={() => { setSearch(""); setCategory("All Categories"); setStatus("All Status"); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", cursor: "pointer", fontSize: "0.83rem" }}>
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                <th style={{ width: "44px", padding: "12px 16px" }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ accentColor: "#2563eb", cursor: "pointer" }} />
                </th>
                <th className="px-4 py-3 text-left"><SortBtn col="id"          sortKey={sortKey} dir={sortDir} onClick={() => toggleSort("id")} /></th>
                <th className="px-4 py-3 text-left"><SortBtn col="name"        sortKey={sortKey} dir={sortDir} onClick={() => toggleSort("name")} /></th>
                {["Category","Unit"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
                <th className="px-4 py-3 text-left"><SortBtn col="quantity" sortKey={sortKey} dir={sortDir} onClick={() => toggleSort("quantity")} /></th>
                {["Min Stock","Location","Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
                <th className="px-4 py-3 text-left"><SortBtn col="lastUpdated" sortKey={sortKey} dir={sortDir} onClick={() => toggleSort("lastUpdated")} /></th>
                <th className="px-4 py-3 text-left" style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const isExpanded = expandedId === item.id;
                const isSelected = selected.has(item.id);
                const stockPct = Math.min(100, Math.round((item.quantity / Math.max(item.minStock * 3, 1)) * 100));

                return (
                  <Fragment key={item.id}>
                    <tr
                      style={{
                        borderBottom: isExpanded ? "none" : "1px solid #f8fafc",
                        background: isSelected ? "#eff6ff" : isExpanded ? "#f0f7ff" : "#fff",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!isSelected && !isExpanded) e.currentTarget.style.background = "#f8fbff"; }}
                      onMouseLeave={(e) => { if (!isSelected && !isExpanded) e.currentTarget.style.background = "#fff"; }}>
                      <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(item.id)} style={{ accentColor: "#2563eb", cursor: "pointer" }} />
                      </td>
                      <td className="px-4 py-3.5" onClick={() => setExpanded(isExpanded ? null : item.id)}>
                        <span style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{item.id}</span>
                      </td>
                      <td className="px-4 py-3.5" onClick={() => setExpanded(isExpanded ? null : item.id)}>
                        <div className="flex items-center gap-2">
                          <p style={{ fontSize: "0.83rem", color: "#0f172a", fontWeight: 600, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                          <ChevronRight style={{ width: "14px", height: "14px", color: "#94a3b8", flexShrink: 0, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5" onClick={() => setExpanded(isExpanded ? null : item.id)}>
                        <span className="px-2 py-0.5 rounded-md" style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.72rem", fontWeight: 500 }}>{item.category}</span>
                      </td>
                      <td className="px-4 py-3.5" style={{ fontSize: "0.83rem", color: "#64748b" }}>{item.unit}</td>
                      <td className="px-4 py-3.5" onClick={() => setExpanded(isExpanded ? null : item.id)}>
                        <div>
                          <p style={{ fontSize: "0.9rem", fontWeight: 800, color: item.quantity < item.minStock ? "#dc2626" : "#0f172a", lineHeight: 1 }}>
                            {item.quantity.toLocaleString()}
                          </p>
                          <div className="mt-1.5 h-1 rounded-full" style={{ width: "56px", background: "#f1f5f9" }}>
                            <div className="h-1 rounded-full" style={{ width: `${stockPct}%`, background: item.quantity === 0 ? "#dc2626" : item.quantity < item.minStock ? "#d97706" : "#16a34a", transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5" style={{ fontSize: "0.83rem", color: "#64748b" }}>{item.minStock}</td>
                      <td className="px-4 py-3.5" style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: "130px" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{item.location}</span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3.5" style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{item.lastUpdated}</td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setExpanded(isExpanded ? null : item.id); toast.info(`Viewing: ${item.name}`); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#eff6ff", border: "none", cursor: "pointer" }}>
                            <Eye style={{ width: "13px", height: "13px", color: "#2563eb" }} />
                          </button>
                          <button onClick={() => toast.info(`Edit mode: ${item.name}`)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#f0fdf4", border: "none", cursor: "pointer" }}>
                            <Edit2 style={{ width: "13px", height: "13px", color: "#16a34a" }} />
                          </button>
                          <button onClick={() => setDeleteId(item.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#fef2f2", border: "none", cursor: "pointer" }}>
                            <Trash2 style={{ width: "13px", height: "13px", color: "#dc2626" }} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded row ── */}
                    {isExpanded && (
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td colSpan={11} style={{ padding: 0 }}>
                          <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #f0f7ff, #f8fafc)", borderTop: "1px dashed #bfdbfe" }}>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-3 grid grid-cols-3 gap-4">
                                {[
                                  { label: "Full Item Name",    val: item.name },
                                  { label: "Category",         val: item.category },
                                  { label: "Unit of Measure",  val: item.unit },
                                  { label: "Current Stock",    val: item.quantity.toLocaleString() + " " + item.unit },
                                  { label: "Minimum Level",    val: item.minStock + " " + item.unit },
                                  { label: "Storage Location", val: item.location },
                                  { label: "Last Updated",     val: item.lastUpdated },
                                  { label: "Item Status",      val: item.status },
                                  { label: "Item Code",        val: item.id },
                                ].map(f => (
                                  <div key={f.label}>
                                    <p style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{f.label}</p>
                                    <p style={{ fontSize: "0.82rem", color: "#1e293b", fontWeight: 500 }}>{f.val}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-2 justify-center">
                                <button onClick={() => toast.info(`Stock Out recorded for ${item.name}`)}
                                  className="btn-primary w-full py-2 rounded-xl text-center flex items-center justify-center gap-1.5"
                                  style={{ fontSize: "0.78rem", borderRadius: "8px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
                                  ▼ Issue Item
                                </button>
                                <button onClick={() => toast.success(`Stock In recorded for ${item.name}`)}
                                  className="w-full py-2 rounded-xl text-center flex items-center justify-center gap-1.5"
                                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", borderRadius: "8px" }}>
                                  ▲ Add Stock
                                </button>
                                <button onClick={() => { setExpanded(null); toast.info(`Edit mode: ${item.name}`); }}
                                  className="btn-secondary w-full py-2 rounded-xl flex items-center justify-center gap-1.5"
                                  style={{ fontSize: "0.78rem", borderRadius: "8px" }}>
                                  ✎ Edit Details
                                </button>
                              </div>
                            </div>

                            {item.quantity < item.minStock && (
                              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#d97706" }} />
                                <span style={{ fontSize: "0.78rem", color: "#92400e" }}>
                                  Stock is below minimum level. Deficit: <strong>{item.minStock - item.quantity} {item.unit}</strong>. Consider raising a purchase indent.
                                </span>
                                <button onClick={() => toast.success("Purchase indent raised!")}
                                  style={{ marginLeft: "auto", background: "#d97706", border: "none", color: "#fff", borderRadius: "6px", padding: "3px 10px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                                  Raise Indent
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              Showing <strong style={{ color: "#0f172a" }}>1–{filtered.length}</strong> of <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> results
            </span>
            <select style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.75rem", padding: "3px 8px", color: "#475569" }}>
              {[10,25,50,100].map(n => <option key={n}>Show {n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {["← Prev","1","2","3","4","Next →"].map((p) => (
              <button key={p} style={{
                padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", cursor: "pointer",
                background: p === "1" ? "#1d4ed8" : "#f8fafc",
                color: p === "1" ? "#fff" : "#475569",
                border: `1px solid ${p === "1" ? "#1d4ed8" : "#e2e8f0"}`,
                fontWeight: p === "1" ? 700 : 400,
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Delete Confirm ── */}
      {deleteId && (() => {
        const item = inventoryItems.find(i => i.id === deleteId)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
            <div className="rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ background: "#fff" }}>
              <div className="px-6 py-5 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#fef2f2" }}>
                  <Trash2 className="w-7 h-7" style={{ color: "#dc2626" }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "8px" }}>Delete Inventory Item?</h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "4px" }}><strong>{item.name}</strong></p>
                <p style={{ color: "#94a3b8", fontSize: "0.78rem" }}>This action cannot be undone. The item will be archived.</p>
              </div>
              <div className="flex gap-3 px-6 pb-5 justify-center">
                <button onClick={() => setDeleteId(null)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
                <button onClick={() => handleDelete(deleteId, item.name)}
                  className="px-5 py-2.5 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #b91c1c, #dc2626)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", borderRadius: "10px" }}>
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Add Item Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" style={{ background: "#fff" }}>
            {saved ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#f0fdf4" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#16a34a" }} />
                </div>
                <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>Item Added Successfully</h3>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>The new inventory item is now in the system.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-5"
                  style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <Package className="w-5 h-5" style={{ color: "#60a5fa" }} />
                    </div>
                    <div>
                      <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Add New Inventory Item</h2>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>Fill in all required fields</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", borderRadius: "8px", padding: "6px", color: "rgba(255,255,255,0.7)" }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Item Name *", placeholder: "Full descriptive name", span: 2 },
                      { label: "Category *", placeholder: "", type: "select" },
                      { label: "Unit of Measure *", placeholder: "Nos / Kg / Liters / Meters" },
                      { label: "Current Quantity *", placeholder: "0", type: "number" },
                      { label: "Minimum Stock Level *", placeholder: "0", type: "number" },
                      { label: "Unit Price (₹)", placeholder: "0.00", type: "number" },
                      { label: "Location *", placeholder: "Store A - Rack 1" },
                      { label: "HSN / SAP Code", placeholder: "e.g. 84295100", span: 2 },
                    ].map((f) => (
                      <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</label>
                        {f.type === "select" ? (
                          <select className="ims-input w-full px-3 py-2.5 rounded-xl" style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }}>
                            {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                          </select>
                        ) : (
                          <input type={f.type ?? "text"} placeholder={f.placeholder} className="ims-input w-full px-3 py-2.5 rounded-xl"
                            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc" }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
                  <button onClick={() => setShowAdd(false)} className="btn-secondary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px" }}>Cancel</button>
                  <button onClick={handleSave} className="btn-primary px-5 py-2.5 rounded-xl" style={{ fontSize: "0.85rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
                    Save Item
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
