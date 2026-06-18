import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Download, Printer, FileText, TrendingUp, TrendingDown, BarChart3, Activity, Calendar, Filter } from "lucide-react";

const monthlyValue: { month: string; receipts: number; issues: number }[] = [];

const deptConsumption: { month: string; underground: number; transport: number; mechanical: number; surface: number }[] = [];

const supplierPerf: { name: string; onTime: number; quality: number; value: number }[] = [];

const COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626"];

const reportTypes = [
  { title: "Monthly Inventory Report",  desc: "Complete stock status, valuation & movement summary",        icon: FileText,    color: "#2563eb", bg: "#eff6ff" },
  { title: "Consumption Analysis",      desc: "Department-wise consumption patterns & trends",              icon: TrendingDown,color: "#7c3aed", bg: "#f5f3ff" },
  { title: "Low Stock Report",          desc: "Items below minimum with procurement recommendations",       icon: TrendingDown,color: "#dc2626", bg: "#fef2f2" },
  { title: "Procurement Report",        desc: "PO status, receipts & supplier-wise comparison",            icon: BarChart3,   color: "#059669", bg: "#f0fdf4" },
  { title: "Supplier Performance",      desc: "Delivery timelines, quality ratings & compliance score",    icon: Activity,    color: "#d97706", bg: "#fffbeb" },
  { title: "Stock In / Out Summary",    desc: "Consolidated receipts vs issues with variance analysis",    icon: TrendingUp,  color: "#0891b2", bg: "#ecfeff" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-xl" style={{ background: "#0f172a", border: "none" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginBottom: "6px" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "#fff", fontSize: "0.75rem" }}>{p.name}: <strong>{p.value}{typeof p.value === "number" && p.value > 10 ? "K" : "%"}</strong></span>
        </div>
      ))}
    </div>
  );
};

export function Reports() {
  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Reports & Analytics</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Generate, schedule and download operational inventory reports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <Calendar className="w-4 h-4" style={{ color: "#64748b" }} />
            <select className="outline-none text-sm" style={{ background: "transparent", border: "none", fontSize: "0.83rem", color: "#0f172a", fontWeight: 600, cursor: "pointer" }}>
              <option>June 2026</option>
              <option>May 2026</option>
              <option>Q1 FY 2026-27</option>
              <option>FY 2025-26 (Annual)</option>
            </select>
          </div>
          <button className="btn-secondary px-3 py-2 rounded-xl flex items-center gap-1.5" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Opening Stock Value",  val: "—", ch: "",       color: "#0f172a" },
          { label: "Total Receipts (MTD)", val: "—",  ch: "", color: "#16a34a" },
          { label: "Total Issues (MTD)",   val: "—",   ch: "",  color: "#d97706" },
          { label: "Closing Stock Value",  val: "—", ch: "",  color: "#2563eb" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, lineHeight: 1, letterSpacing: "-0.01em" }}>{s.val}</p>
            {s.ch && <p style={{ fontSize: "0.72rem", color: "#16a34a", marginTop: "6px", fontWeight: 600 }}>{s.ch} vs May 2026</p>}
          </div>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-3 gap-4">
        {reportTypes.map(r => (
          <div key={r.title} className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div className="flex items-start gap-4 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.bg }}>
                <r.icon style={{ width: "20px", height: "20px", color: r.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.88rem", marginBottom: "4px" }}>{r.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl flex-1"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer", fontSize: "0.75rem", fontWeight: 500 }}>
                <Download style={{ width: "13px", height: "13px" }} /> PDF
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl flex-1"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer", fontSize: "0.75rem", fontWeight: 500 }}>
                <Download style={{ width: "13px", height: "13px" }} /> Excel
              </button>
              <button className="flex items-center justify-center px-2.5 py-2 rounded-xl"
                style={{ background: r.bg, border: "none", cursor: "pointer" }}>
                <Printer style={{ width: "14px", height: "14px", color: r.color }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Stock In vs Out */}
        <div className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.92rem" }}>Stock In vs Stock Out (₹ '000)</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Monthly value comparison · Jan – Jun 2026</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {monthlyValue.length === 0 ? (
              <div className="flex h-full items-center justify-center" style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No stock movement data yet</div>
            ) : (
            <BarChart data={monthlyValue} barGap={4} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.72rem", paddingTop: "12px" }} />
              <Bar dataKey="receipts" fill="#2563eb" radius={[4,4,0,0]} name="Stock In"  maxBarSize={28} />
              <Bar dataKey="issues"   fill="#7c3aed" radius={[4,4,0,0]} name="Stock Out" maxBarSize={28} />
            </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Supplier Performance */}
        <div className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <div className="mb-4">
            <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.92rem" }}>Supplier Performance Score</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>On-time delivery & quality rating (%)</p>
          </div>
          <div className="space-y-3">
            {supplierPerf.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center rounded-xl" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0", color: "#94a3b8", fontSize: "0.82rem" }}>
                No supplier performance data yet
              </div>
            ) : supplierPerf.map((s, i) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: "0.78rem", color: "#374151", fontWeight: 500 }}>{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>OTD: <strong style={{ color: s.onTime >= 95 ? "#16a34a" : "#d97706" }}>{s.onTime}%</strong></span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>QC: <strong style={{ color: s.quality >= 95 ? "#16a34a" : "#d97706" }}>{s.quality}%</strong></span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#f1f5f9" }}>
                  <div className="h-2 rounded-full" style={{ width: `${s.onTime}%`, background: COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept consumption trend */}
      <div className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.92rem" }}>Department-wise Consumption Trend</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Units issued per department — Jan to Jun 2026</p>
          </div>
          <button className="btn-secondary px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ fontSize: "0.75rem", borderRadius: "8px" }}>
            <Download style={{ width: "13px", height: "13px" }} /> Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          {deptConsumption.length === 0 ? (
            <div className="flex h-full items-center justify-center" style={{ color: "#94a3b8", fontSize: "0.82rem" }}>No department consumption data yet</div>
          ) : (
          <LineChart data={deptConsumption} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.72rem", paddingTop: "12px" }} />
            <Line type="monotone" dataKey="underground" stroke={COLORS[0]} strokeWidth={2} name="Underground Mining" dot={false} />
            <Line type="monotone" dataKey="transport"   stroke={COLORS[1]} strokeWidth={2} name="Transport"          dot={false} />
            <Line type="monotone" dataKey="mechanical"  stroke={COLORS[2]} strokeWidth={2} name="Mechanical"         dot={false} />
            <Line type="monotone" dataKey="surface"     stroke={COLORS[3]} strokeWidth={2} name="Surface Mining"     dot={false} />
          </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
