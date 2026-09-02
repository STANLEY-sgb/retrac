import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Building2, KeyRound, Mail, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('sulait.bwambale@retrac.ug');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (roleKey) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(roleKey);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-teal-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/logo.svg" alt="ReTrac Logo" className="w-12 h-12" />
          <span className="text-3xl font-black tracking-tight text-white flex items-center gap-1">
            Re<span className="text-teal-400">Trac</span>
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-black text-white">Caseworker & Staff Portal</h2>
        <p className="mt-1 text-xs text-slate-400">
          Digital Aftercare & Recovery Monitoring Platform &bull; Uganda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="caseworker@retrac.ug"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Sign In Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 text-center mb-3">
              1-Click Demo Login (DOMINION 2026)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuick('caseworker')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Bwambale Sulait</p>
                  <p className="text-3xs text-blue-700">Senior Caseworker</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('caseworker_sarah')}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 text-sky-900 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Sarah Namukasa</p>
                  <p className="text-3xs text-sky-700">Community Caseworker</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Musinguzi Alituha</p>
                  <p className="text-3xs text-purple-700">System Admin</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('employer')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 text-teal-900 text-left transition-colors flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  K
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Kampala Skills</p>
                  <p className="text-3xs text-teal-700">Employer Partner</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Back to ReTrac Home
          </Link>
        </div>
      </div>
    </div>
  );
}
