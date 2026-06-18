import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Package, PackageMinus, PackageCheck, AlertTriangle, IndianRupee,
  TrendingUp, TrendingDown, Clock, Activity, RefreshCw, Download,
  FileText, ArrowRight, ChevronRight
} from "lucide-react";
import { getDashboardData, type DashboardActivity } from "../lib/appData";
import { ApiError } from "../lib/api";
import { toast } from "sonner";

/* ── Animated counter hook ── */
function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const pct = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(Math.round(ease * target));
      if (pct < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current!);
  }, [target, duration]);
  return val;
}

const PALETTE = { blue: "#2563eb", purple: "#7c3aed", amber: "#d97706", red: "#dc2626", green: "#16a34a", teal: "#0891b2" };

/* ── KPI Card ── */
function KPICard({ title, value, sub, icon: Icon, trend, trendLabel, iconColor, target, href, prefix = "", suffix = "" }: {
  title: string; value: string; sub: string; icon: any; trend: "up"|"down"|"neutral";
  trendLabel: string; iconColor: string; target: number; href: string; prefix?: string; suffix?: string;
}) {
  const navigate = useNavigate();
  const animated = useCounter(target);
  const [hovered, setHovered] = useState(false);

  const display = prefix + (target > 10000
    ? (animated / 10000000).toFixed(2) + " Cr"
    : target > 999
    ? animated.toLocaleString()
    : animated.toString()) + suffix;

  return (
    <div onClick={() => { navigate(href); toast.info(`Navigating to ${title}`); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-5 relative overflow-hidden cursor-pointer"
      style={{
        background: "#ffffff", border: `1px solid ${hovered ? iconColor + "40" : "#e2e8f0"}`,
        boxShadow: hovered ? `0 8px 24px ${iconColor}18` : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease", transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: iconColor }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{title}</p>
          <p style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
            {display}
          </p>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.4rem" }}>{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconColor + "18" }}>
          <Icon style={{ width: "20px", height: "20px", color: iconColor }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
        <div className="flex items-center gap-1.5">
          {trend === "up" ? <TrendingUp style={{ width: "13px", height: "13px", color: PALETTE.green }} /> :
           trend === "down" ? <TrendingDown style={{ width: "13px", height: "13px", color: PALETTE.red }} /> :
           <Activity style={{ width: "13px", height: "13px", color: "#64748b" }} />}
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: trend === "up" ? PALETTE.green : trend === "down" ? PALETTE.red : "#64748b" }}>{trendLabel}</span>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>vs last month</span>
        </div>
        <ChevronRight style={{ width: "14px", height: "14px", color: hovered ? iconColor : "#cbd5e1", transition: "color 0.2s, transform 0.2s", transform: hovered ? "translateX(2px)" : "none" }} />
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>{title}</h3>
        {sub && <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── CSS-Based Bar Chart ── */
function SimpleBarChart({ data, title, colors }: { data: any[]; title: string; colors: { [key: string]: string } }) {
  const hasValues = data.some((d) =>
    (d.fuel || 0) + (d.parts || 0) + (d.safety || 0) + (d.issued || 0) + (d.received || 0) > 0,
  );

  if (!data.length || !hasValues) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
        <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>No data yet</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap(d => [d.fuel || 0, d.parts || 0, d.safety || 0, d.issued || 0, d.received || 0]), 1);
  
  return (
    <div>
      <div className="flex items-end justify-between gap-3" style={{ height: "200px" }}>
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2" style={{ height: "100%" }}>
            <div className="flex-1 flex items-end justify-center gap-1 w-full">
              {item.fuel !== undefined && (
                <div className="flex flex-col items-center justify-end flex-1">
                  <div 
                    className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${(item.fuel / maxValue) * 100}%`,
                      background: colors.fuel || PALETTE.blue,
                      minHeight: "4px"
                    }}
                    onMouseEnter={(e) => {
                      const tooltip = document.createElement('div');
                      tooltip.className = 'tooltip-temp';
                      tooltip.textContent = `Fuel: ${item.fuel}`;
                      tooltip.style.cssText = 'position: absolute; background: #0f172a; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; pointer-events: none; z-index: 1000;';
                      document.body.appendChild(tooltip);
                      tooltip.style.left = e.clientX + 'px';
                      tooltip.style.top = (e.clientY - 30) + 'px';
                    }}
                    onMouseLeave={() => {
                      document.querySelectorAll('.tooltip-temp').forEach(el => el.remove());
                    }}
                  />
                </div>
              )}
              {item.parts !== undefined && (
                <div className="flex flex-col items-center justify-end flex-1">
                  <div 
                    className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${(item.parts / maxValue) * 100}%`,
                      background: colors.parts || PALETTE.purple,
                      minHeight: "4px"
                    }}
                  />
                </div>
              )}
              {item.safety !== undefined && (
                <div className="flex flex-col items-center justify-end flex-1">
                  <div 
                    className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${(item.safety / maxValue) * 100}%`,
                      background: colors.safety || PALETTE.teal,
                      minHeight: "4px"
                    }}
                  />
                </div>
              )}
              {item.issued !== undefined && (
                <div className="flex flex-col items-center justify-end flex-1">
                  <div 
                    className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${(item.issued / maxValue) * 100}%`,
                      background: colors.issued || PALETTE.blue,
                      minHeight: "4px"
                    }}
                  />
                </div>
              )}
              {item.received !== undefined && (
                <div className="flex flex-col items-center justify-end flex-1">
                  <div 
                    className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ 
                      height: `${(item.received / maxValue) * 100}%`,
                      background: colors.received || PALETTE.green,
                      minHeight: "4px"
                    }}
                  />
                </div>
              )}
            </div>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CSS-Based Pie Chart ── */
function SimplePieChart({ data }: { data: any[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className="flex h-[140px] items-center justify-center rounded-xl" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
        <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>No categories yet</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: "140px", height: "140px" }}>
        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          {data.map((item, i) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
            const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
            
            const largeArc = angle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`;
            
            return (
              <path
                key={i}
                d={pathData}
                fill={item.color}
                opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                style={{ 
                  cursor: "pointer", 
                  transition: "opacity 0.2s, transform 0.2s",
                  transformOrigin: "50px 50px"
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => {
                  setActiveIndex(activeIndex === i ? null : i);
                  toast.info(`Category: ${item.name} (${item.value}%)`);
                }}
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null);
  const [filteredActivity, setFiltered] = useState<DashboardActivity[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getDashboardData();
      setDashboardData(data);
      setFiltered(data.recentActivity);
      setLastRefresh(new Date());
    } catch (err) {
      setDashboardData(null);
      setLoadError(err instanceof ApiError ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const handleRefresh = () => {
    void loadDashboard();
    toast.success("Dashboard refreshed successfully");
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading dashboard data...
      </div>
    );
  }

  if (loadError || !dashboardData) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {loadError || "Unable to load dashboard data."}
        </div>
        <button onClick={() => void loadDashboard()} className="btn-secondary px-4 py-2 rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  const { kpiData, usageTrendData, categoryData, monthlyConsumptionData, recentActivity } = dashboardData;

  const criticalAlerts = [
    ...dashboardData.recentActivity
      .filter((a) => a.icon === "alert")
      .map((a) => ({
        item: a.item,
        level: a.quantity === 0 ? "OUT OF STOCK" : "LOW STOCK",
        qty: `${a.quantity}`,
        color: a.quantity === 0 ? PALETTE.red : "#d97706",
        bg: a.quantity === 0 ? "#fef2f2" : "#fffbeb",
        border: a.quantity === 0 ? "#fecaca" : "#fde68a",
        href: "/inventory",
      })),
  ].slice(0, 4);

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>Operations Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>
            Bharat Coking Coal Limited · Central Inventory Control · FY 2026-27
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            <div className="w-2 h-2 rounded-full status-online" style={{ background: PALETTE.green }} />
            <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>Live</span>
            <Clock className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: "0.75rem", color: "#475569" }}>
              {lastRefresh.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <button onClick={handleRefresh} className="btn-secondary px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ fontSize: "0.78rem", borderRadius: "8px" }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button className="btn-secondary px-3 py-2 rounded-lg flex items-center gap-1.5" style={{ fontSize: "0.78rem", borderRadius: "8px" }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard title="Total Inventory Items" value={String(kpiData.totalItems)} sub="Items in inventory"
          icon={Package} trend="neutral" trendLabel="Current" iconColor={PALETTE.blue}
          target={kpiData.totalItems} href="/inventory" />
        <KPICard title="Items Issued (MTD)" value={String(kpiData.usedItems)} sub="Total issued quantity"
          icon={PackageMinus} trend="neutral" trendLabel="Current" iconColor={PALETTE.purple}
          target={kpiData.usedItems} href="/used-items" />
        <KPICard title="Procurement Required" value={String(kpiData.requiredItems)} sub="Items below min level"
          icon={PackageCheck} trend="neutral" trendLabel="Current" iconColor={PALETTE.amber}
          target={kpiData.requiredItems} href="/required-items" />
        <KPICard title="Low Stock Alerts" value={String(kpiData.lowStockItems)} sub="Immediate attention needed"
          icon={AlertTriangle} trend="neutral" trendLabel="Current" iconColor={PALETTE.red}
          target={kpiData.lowStockItems} href="/required-items" />
        <KPICard title="Total Stock Units" value={String(kpiData.totalValue)} sub="Sum of all quantities"
          icon={IndianRupee} trend="neutral" trendLabel="Current" iconColor={PALETTE.green}
          target={kpiData.totalValue} href="/reports" />
      </div>

      {/* Row 2: Usage Trend + Alerts */}
      <div className="grid grid-cols-3 gap-4">

        {/* Usage Trend */}
        <div className="col-span-2 rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <SectionHeader
            title="Inventory Usage Trend"
            sub="Jan – Jun 2026"
            action={
              <div className="flex items-center gap-4">
                {[{ c: PALETTE.blue, l: "Issued" }, { c: PALETTE.green, l: "Received" }].map(x => (
                  <div key={x.l} className="flex items-center gap-1.5">
                    <div className="w-6 h-1.5 rounded" style={{ background: x.c }} />
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{x.l}</span>
                  </div>
                ))}
              </div>
            }
          />
          <SimpleBarChart 
            data={usageTrendData} 
            title="Usage Trend"
            colors={{ issued: PALETTE.blue, received: PALETTE.green }}
          />
        </div>

        {/* Critical Alerts Panel */}
        <div className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <SectionHeader title="Critical Alerts" sub="Requires action" />
          <div className="space-y-2.5">
            {criticalAlerts.length === 0 ? (
              <div className="rounded-xl px-4 py-8 text-center" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>No alerts — inventory looks good</p>
              </div>
            ) : criticalAlerts.map((a) => (
                <div key={a.item} onClick={() => navigate(a.href)}
                  className="rounded-xl px-4 py-3 cursor-pointer"
                  style={{ background: a.bg, border: `1px solid ${a.border}`, transition: "transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${a.color}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded" style={{ background: a.color + "20", color: a.color, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.06em" }}>{a.level}</span>
                    <span style={{ fontSize: "0.72rem", color: a.color, fontWeight: 700 }}>{a.qty}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#1e293b", fontWeight: 500, marginTop: "4px" }}>{a.item}</p>
                </div>
              ))}
          </div>
          <button onClick={() => navigate("/required-items")}
            className="w-full mt-4 py-2 rounded-xl flex items-center justify-center gap-1.5"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: PALETTE.red, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            View All Alerts <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 3: Bar Chart + Pie */}
      <div className="grid grid-cols-3 gap-4">

        {/* Monthly Consumption */}
        <div className="col-span-2 rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <SectionHeader title="Monthly Stock Consumption" sub="By category · Jan – Jun 2026" />
          <div className="flex items-center gap-5 mb-3">
            {[
              { key: "fuel",   color: PALETTE.blue,   label: "Fuel & Lubricants" },
              { key: "parts",  color: PALETTE.purple, label: "Machinery Parts" },
              { key: "safety", color: PALETTE.teal,   label: "Safety Equipment" },
            ].map(s => (
              <div key={s.key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{s.label}</span>
              </div>
            ))}
          </div>
          <SimpleBarChart 
            data={monthlyConsumptionData}
            title="Monthly Consumption"
            colors={{ fuel: PALETTE.blue, parts: PALETTE.purple, safety: PALETTE.teal }}
          />
        </div>

        {/* Category Distribution */}
        <div className="rounded-2xl p-5 card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <SectionHeader title="Category Mix" sub="Click to highlight" />
          <SimplePieChart data={categoryData} />
          <div className="space-y-1.5 mt-4">
            {categoryData.map((c, i) => (
              <div key={c.name}
                className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer"
                style={{ background: "transparent", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = c.color + "10"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span style={{ fontSize: "0.72rem", color: "#475569", flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: "0.72rem", color: "#0f172a", fontWeight: 600, minWidth: "28px", textAlign: "right" }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl card-elevated" style={{ background: "#fff", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>Recent Activity</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>
              {filteredActivity.length < recentActivity.length ? (
                <span style={{ color: PALETTE.blue }}>Filtered - {filteredActivity.length} results · <button onClick={() => setFiltered(recentActivity)} style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.blue, textDecoration: "underline", fontSize: "0.72rem" }}>Clear</button></span>
              ) : "Latest inventory movements and transactions"}
            </p>
          </div>
          <button onClick={() => navigate("/used-items")} className="btn-secondary px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ fontSize: "0.78rem", borderRadius: "8px" }}>
            <FileText className="w-3.5 h-3.5" /> Full Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                {["Type", "Item Name", "Quantity", "Department / Location", "Time", "Action"].map((h) => (
                  <th key={h} className="text-left px-6 py-3"
                    style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center" style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    No recent activity yet
                  </td>
                </tr>
              ) : filteredActivity.map((a, i) => (
                <tr key={`activity-${i}`} className="data-row" style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: a.icon === "in" ? "#f0fdf4" : a.icon === "out" ? "#eff6ff" : "#fef2f2",
                        color:      a.icon === "in" ? PALETTE.green : a.icon === "out" ? PALETTE.blue : PALETTE.red,
                        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
                      }}>
                      {a.icon === "in" ? "▲ STOCK IN" : a.icon === "out" ? "▼ ISSUED" : "⚠ ALERT"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5" style={{ fontSize: "0.83rem", color: "#1e293b", fontWeight: 500 }}>{a.item}</td>
                  <td className="px-6 py-3.5" style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 700 }}>{a.quantity.toLocaleString()}</td>
                  <td className="px-6 py-3.5" style={{ fontSize: "0.82rem", color: "#64748b" }}>{a.dept}</td>
                  <td className="px-6 py-3.5" style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{a.time}</td>
                  <td className="px-6 py-3.5">
                    <button onClick={() => toast.info(`Viewing details for: ${a.item}`)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.blue, fontSize: "0.78rem", fontWeight: 600 }}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
