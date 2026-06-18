import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Lock, User, Shield, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { signIn } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      setError("");
      setLoading(true);
      try {
        await signIn({ employeeId: empId, password, rememberMe });
        navigate("/");
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to sign in right now.");
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif", background: "#0c1a2e" }}>
      {/* ── Left: Branding Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: "52%", background: "linear-gradient(160deg, #0c1a2e 0%, #1e3a5f 55%, #0f2744 100%)" }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* Mining SVG illustration */}
        <div className="absolute bottom-0 left-0 right-0 opacity-10">
          <svg viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Conveyor belt structure */}
            <rect x="50" y="200" width="700" height="12" rx="4" fill="#60a5fa" />
            <rect x="50" y="200" width="700" height="4" rx="2" fill="#93c5fd" />
            {[100,200,300,400,500,600,700].map(x => (
              <circle key={x} cx={x} cy="206" r="14" fill="none" stroke="#60a5fa" strokeWidth="3" />
            ))}
            {/* Coal hopper */}
            <polygon points="580,60 660,60 680,140 560,140" fill="#2563eb" opacity="0.6" />
            <rect x="545" y="135" width="150" height="8" rx="3" fill="#3b82f6" />
            {/* Tower */}
            <rect x="100" y="50" width="20" height="155" fill="#1d4ed8" opacity="0.7" />
            <rect x="80" y="45" width="60" height="15" rx="3" fill="#2563eb" opacity="0.8" />
            <polygon points="100,45 120,45 140,15 80,15" fill="#3b82f6" opacity="0.6" />
            {/* Small dots = coal */}
            {[140,180,220,260,300,340,380,420,460].map((x,i) => (
              <circle key={i} cx={x} cy={195+((i%3)*2)} r="4" fill="#475569" />
            ))}
            {/* Ground line */}
            <rect x="0" y="210" width="800" height="90" fill="#1e293b" opacity="0.4" />
          </svg>
        </div>

        {/* Top logo */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 8px 20px rgba(245,158,11,0.35)" }}>
              <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                <path d="M20 4L36 28H4L20 4Z" fill="#0c1a2e" fillOpacity="0.9" />
                <rect x="6" y="28" width="28" height="8" rx="2" fill="#0c1a2e" fillOpacity="0.9" />
                <rect x="15" y="18" width="10" height="10" rx="1" fill="#f59e0b" opacity="0.5" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.08em" }}>BCCL</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Bharat Coking Coal Limited</div>
            </div>
          </div>

          <h1 style={{ color: "#ffffff", fontWeight: 800, fontSize: "2.6rem", lineHeight: 1.15, marginBottom: "1.25rem" }}>
            Enterprise<br />
            <span style={{ color: "#60a5fa" }}>Inventory</span><br />
            Management
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: "360px" }}>
            Unified material tracking system for all collieries, stores, and depots across BCCL operations.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {["Real-time Tracking", "SAP-Ready", "Role-Based Access", "Audit Trail"].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
                <ChevronRight style={{ width: "12px", height: "12px", color: "#60a5fa" }} />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 px-12 pb-10">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "47", label: "Active Stores" },
              { value: "1,247", label: "Item Codes" },
              { value: "23", label: "Departments" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4 text-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginTop: "0.375rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", marginTop: "1.5rem", textAlign: "center" }}>
            A Subsidiary of Coal India Limited · Government of India Undertaking
          </p>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative"
        style={{ background: "#f0f4f8" }}>

        {/* Top right system badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="w-2 h-2 rounded-full status-online" style={{ background: "#16a34a" }} />
          <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 500 }}>System Online</span>
        </div>

        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <Shield className="w-5 h-5" style={{ color: "#fff" }} />
            </div>
            <div>
              <div style={{ color: "#0f172a", fontWeight: 800 }}>BCCL-IMS</div>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Inventory Management System</div>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)" }}>

            {/* Card header bar */}
            <div className="px-8 py-5" style={{ background: "linear-gradient(135deg, #0c1a2e, #1e3a5f)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>Secure Login Portal</p>
              <h2 style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.35rem" }}>Sign In to BCCL-IMS</h2>
            </div>

            <div className="px-8 py-7">
              {error && (
                <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-lg"
                  style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                  <span style={{ fontSize: "0.8rem", color: "#dc2626" }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Employee ID */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Employee ID / Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#f1f5f9" }}>
                      <User className="w-4 h-4" style={{ color: "#64748b" }} />
                    </div>
                    <Input
                      type="text"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder="e.g. EMP-1001 or admin"
                      className="h-12 rounded-xl pl-14 pr-4 text-[0.9rem] bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#f1f5f9" }}>
                      <Lock className="w-4 h-4" style={{ color: "#64748b" }} />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 rounded-xl pl-14 pr-12 text-[0.9rem] bg-slate-50 border-slate-200"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#f1f5f9", border: "none", cursor: "pointer" }}>
                      {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "#64748b" }} /> : <Eye className="w-4 h-4" style={{ color: "#64748b" }} />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: rememberMe ? "#1d4ed8" : "#f8fafc", border: `1.5px solid ${rememberMe ? "#1d4ed8" : "#d1d5db"}`, transition: "all 0.15s" }}
                      onClick={() => setRememberMe(!rememberMe)}>
                      {rememberMe && <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "#475569" }}>Keep me signed in</span>
                  </label>
                  <button type="button"
                    style={{ fontSize: "0.82rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Forgot password?
                  </button>
                </div>

                {/* Sign in button */}
                <Button type="submit" disabled={loading}
                  className="w-full rounded-xl py-6 flex items-center justify-center gap-2 mt-2 text-[0.95rem] tracking-[0.02em] bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>Sign In <ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              </form>

              {/* Demo hint */}
              <div className="mt-5 p-3 rounded-lg" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <p style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 500, marginBottom: "0.25rem" }}>Demo Access</p>
                <p style={{ fontSize: "0.72rem", color: "#475569" }}>Enter any Employee ID and Password to explore the system.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <Shield className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>256-bit SSL Encrypted · IT Security Division, BCCL</p>
          </div>
          <p style={{ fontSize: "0.7rem", color: "#cbd5e1", textAlign: "center", marginTop: "0.5rem" }}>
            Helpdesk: <strong>ext. 1234</strong> · helpdesk@bccl.co.in
          </p>
        </div>
      </div>
    </div>
  );
}
