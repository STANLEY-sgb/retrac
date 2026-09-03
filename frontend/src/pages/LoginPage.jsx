import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, HeartHandshake, Shield, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";

const DEMOS = [
  {
    key: "caseworker",
    name: "Bwambale S.",
    role: "Caseworker",
    desc: "Monitor patients, send check-ins, log interventions",
    icon: HeartHandshake,
    color: "border-teal-400/40 bg-teal-900/20 hover:border-teal-400/70",
    badge: "text-teal-300 bg-teal-900/40 border-teal-700/40",
  },
  {
    key: "caseworker_sarah",
    name: "Sarah N.",
    role: "Caseworker",
    desc: "Second caseworker — distinct caseload view",
    icon: HeartHandshake,
    color: "border-teal-400/40 bg-teal-900/20 hover:border-teal-400/70",
    badge: "text-teal-300 bg-teal-900/40 border-teal-700/40",
  },
  {
    key: "admin",
    name: "Stanley",
    role: "Admin",
    desc: "Full system access, staff management, audit logs",
    icon: Shield,
    color: "border-blue-400/40 bg-blue-900/20 hover:border-blue-400/70",
    badge: "text-blue-300 bg-blue-900/40 border-blue-700/40",
  },
  {
    key: "employer",
    name: "Kampala Skills",
    role: "Employer Partner",
    desc: "Post vacancies, review candidates, disburse wages",
    icon: Briefcase,
    color: "border-amber-400/40 bg-amber-900/20 hover:border-amber-400/70",
    badge: "text-amber-300 bg-amber-900/40 border-amber-700/40",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState("sulait.bwambale@retrac.ug");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try a demo card below.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (roleKey) => {
    setError(null);
    setLoadingKey(roleKey);
    try {
      await quickLogin(roleKey);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111a] flex flex-col" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(13,148,136,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(8,47,73,0.3) 0%, transparent 40%)" }}>

      {/* Header */}
      <header className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" className="w-8 h-8" />
          <span className="text-xl font-extrabold text-white">
            Re<span className="text-teal-400">Trac</span>
          </span>
        </Link>
        <span className="px-2 py-1 rounded-md bg-teal-900/40 text-teal-300 text-[10px] font-bold border border-teal-700/30 uppercase tracking-wider">
          DOMINION 2026
        </span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

        {/* Title */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400 mb-3">Secure Portal Access</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sign in to ReTrac</h1>
          <p className="mt-2 text-sm text-slate-400">Stay Connected. Stay Recovered. Rebuild Your Life.</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {/* Login Form Card */}
          <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-3xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:bg-white/8 transition-all"
                  placeholder="Email address"
                />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:bg-white/8 transition-all"
                  placeholder="Password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                ) : (
                  <>Sign in <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Demo Role Cards */}
          <div>
            <p className="text-center text-xs text-slate-500 font-medium mb-3 uppercase tracking-wider">
              — or tap a demo role to explore instantly —
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMOS.map((d) => {
                const Icon = d.icon;
                const isLoading = loadingKey === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleQuick(d.key)}
                    disabled={!!loadingKey}
                    className={`p-3.5 rounded-2xl border transition-all text-left group disabled:opacity-60 ${d.color}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Avatar name={d.name} size="sm" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-200 leading-tight">{d.name}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${d.badge} uppercase tracking-wider`}>
                          {d.role}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{d.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-600 text-center max-w-xs">
          ReTrac is a DOMINION 2026 hackathon demo. All data is synthetic and for evaluation purposes only.
        </p>
      </div>
    </div>
  );
}
