import { useState } from "react";
import { Save, Building2, Bell, Shield, Database, Globe, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TABS = [
  { id: "general",       label: "General",       icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security",      label: "Security",       icon: Shield },
  { id: "backup",        label: "Backup & Data",  icon: Database },
  { id: "system",        label: "System Info",    icon: Globe },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <div className="w-11 h-6 rounded-full relative flex-shrink-0" style={{ background: on ? "#2563eb" : "#e2e8f0", cursor: "pointer" }}>
      <div className="absolute top-1 w-4 h-4 rounded-full"
        style={{ background: "#fff", left: on ? "calc(100% - 20px)" : "4px", transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

function FormRow({ label, sub, value, type = "text" }: { label: string; sub?: string; value: string; type?: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center py-4" style={{ borderBottom: "1px solid #f8fafc" }}>
      <div>
        <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>{label}</p>
        {sub && <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{sub}</p>}
      </div>
      <div className="col-span-2">
        {type === "select" ? (
          <select defaultValue={value} className="ims-input px-3 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc", width: "260px" }}>
            <option>{value}</option>
          </select>
        ) : (
          <input type={type} defaultValue={value} className="ims-input px-3 py-2.5 rounded-xl"
            style={{ border: "1.5px solid #e2e8f0", fontSize: "0.85rem", background: "#f8fafc", width: "260px" }} />
        )}
      </div>
    </div>
  );
}

export function Settings() {
  const [active, setActive] = useState("general");
  const [saved,  setSaved]  = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved", { description: "All changes applied successfully." });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.01em" }}>System Settings</h1>
          <p style={{ color: "#64748b", fontSize: "0.82rem", marginTop: "3px" }}>Configure system preferences, security and operational parameters</p>
        </div>
        <button onClick={handleSave}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ fontSize: "0.83rem", borderRadius: "10px", background: saved ? "linear-gradient(135deg, #15803d, #16a34a)" : "linear-gradient(135deg, #1d4ed8, #2563eb)", transition: "background 0.3s" }}>
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Changes Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActive(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 relative"
                style={{
                  background: active === tab.id ? "#eff6ff" : "transparent",
                  color: active === tab.id ? "#1d4ed8" : "#475569",
                  border: "none",
                  borderLeft: `3px solid ${active === tab.id ? "#2563eb" : "transparent"}`,
                  cursor: "pointer", fontSize: "0.83rem",
                  fontWeight: active === tab.id ? 700 : 400,
                  textAlign: "left", transition: "all 0.15s",
                }}>
                <tab.icon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* System status card */}
          <div className="rounded-2xl p-4 mt-4" style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>System Health</p>
            {[
              { label: "Server", status: "Online", ok: true },
              { label: "Database", status: "Connected", ok: true },
              { label: "Backup", status: "Running", ok: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>{s.label}</span>
                <span className="flex items-center gap-1" style={{ fontSize: "0.68rem", color: "#4ade80", fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />{s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {active === "general" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>General Configuration</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Organization identity and operational defaults</p>
              </div>
              <div className="px-6 py-2">
                <FormRow label="Organization Name" sub="Legal entity name" value="Bharat Coking Coal Limited" />
                <FormRow label="Short Name" sub="Used in reports and headers" value="BCCL" />
                <FormRow label="Primary Location" sub="Headquarters" value="Dhanbad, Jharkhand" />
                <FormRow label="Parent Organization" sub="Holding company" value="Coal India Limited" />
                <FormRow label="Financial Year Start" sub="For reports" value="April" type="select" />
                <FormRow label="Default Currency" sub="For valuations" value="INR (₹)" type="select" />
                <FormRow label="Low Stock Threshold (%)" sub="Alert trigger level" value="20" type="number" />
                <FormRow label="Date Format" sub="Display format" value="DD-MM-YYYY" type="select" />
              </div>
            </div>
          )}

          {active === "notifications" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>Notification Preferences</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Configure alerts, emails and system notifications</p>
              </div>
              <div className="px-6 py-4 divide-y" style={{ borderColor: "#f8fafc" }}>
                {[
                  { label: "Low Stock Alerts",        sub: "When items fall below minimum level",           on: true  },
                  { label: "Out of Stock Alerts",     sub: "Immediate alert when stock reaches zero",       on: true  },
                  { label: "New Stock Receipt",        sub: "Notify on PO receipt confirmation",             on: true  },
                  { label: "Pending Approval Reminders",sub:"Hourly reminders for pending approvals",       on: true  },
                  { label: "Daily Summary Email",     sub: "End-of-day inventory digest",                   on: false },
                  { label: "Weekly Analytics Report", sub: "Monday morning consumption summary",            on: false },
                  { label: "Supplier Performance Alerts",sub:"When supplier rating drops below threshold",  on: true  },
                  { label: "System Maintenance Alerts",sub:"Scheduled downtime and patch notifications",    on: false },
                ].map((n, i) => (
                  <div key={n.label} className="flex items-center justify-between py-4">
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>{n.label}</p>
                      <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{n.sub}</p>
                    </div>
                    <Toggle on={n.on} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "security" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>Security & Access Control</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Authentication, session and audit configuration</p>
              </div>
              <div className="px-6 py-2">
                <FormRow label="Session Timeout" sub="Auto-logout after inactivity" value="30" type="number" />
                <FormRow label="Min Password Length" sub="Character requirement" value="8" type="number" />
                <FormRow label="Max Login Attempts" sub="Before account lockout" value="3" type="number" />
                <FormRow label="Lockout Duration (mins)" sub="Account unlock after" value="15" type="number" />
              </div>
              <div className="px-6 py-4" style={{ borderTop: "1px solid #f8fafc" }}>
                {[
                  { label: "Two-Factor Authentication", sub: "OTP required for admin logins", on: true },
                  { label: "Full Audit Logging", sub: "Track all user actions and data changes", on: true },
                  { label: "IP Whitelist Enforcement", sub: "Only allow access from approved IPs", on: false },
                  { label: "Session Concurrency Limit", sub: "Prevent multiple simultaneous logins", on: true },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #f8fafc" }}>
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>{n.label}</p>
                      <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>{n.sub}</p>
                    </div>
                    <Toggle on={n.on} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "backup" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>Backup & Data Management</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Automated backup schedules and retention policies</p>
              </div>
              <div className="px-6 py-4">
                <div className="rounded-xl p-4 mb-5 flex items-center gap-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#16a34a" }} />
                  <div>
                    <p style={{ fontWeight: 600, color: "#15803d", fontSize: "0.85rem" }}>Last Backup Successful</p>
                    <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Today at 02:00 AM · /mnt/nas/bccl-ims/backup-2026-06-09 · 4.2 GB</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-2">
                <FormRow label="Backup Frequency" sub="Schedule" value="Daily at 02:00 AM" type="select" />
                <FormRow label="Retention Period" sub="Days to keep backups" value="90" type="number" />
                <FormRow label="Backup Destination" sub="Storage path / NAS" value="/mnt/nas/bccl-ims" />
                <FormRow label="Compression Level" sub="Storage optimization" value="High" type="select" />
              </div>
              <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                <button className="btn-primary px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
                  Backup Now
                </button>
                <button className="btn-secondary px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
                  Export Full Database
                </button>
                <button className="btn-secondary px-4 py-2.5 rounded-xl" style={{ fontSize: "0.83rem", borderRadius: "10px" }}>
                  Restore from Backup
                </button>
              </div>
            </div>
          )}

          {active === "system" && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "0.95rem" }}>System Information</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>Application, server and license details</p>
              </div>
              <div className="grid grid-cols-2 gap-0 px-6 py-4">
                {[
                  ["Application Name",    "BCCL Inventory Management System"],
                  ["Version",             "v2.4.1 (Build 20260601)"],
                  ["Database",            "PostgreSQL 15.2"],
                  ["Server OS",           "RHEL 9.2 (64-bit)"],
                  ["Web Server",          "Nginx 1.24"],
                  ["Last Updated",        "2026-05-15"],
                  ["Total Item Records",  "1,247"],
                  ["Total Transactions",  "14,892"],
                  ["Active Users",        "6 of 12 licensed"],
                  ["API Integration",     "SAP IS-MM (Pending)"],
                  ["License Type",        "Enterprise"],
                  ["License Expiry",      "2027-03-31"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid #f8fafc", paddingLeft: "0", gridColumn: label.length > 20 ? "span 1" : "auto" }}>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{label}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
