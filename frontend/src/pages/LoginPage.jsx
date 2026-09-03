import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, quickLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('sulait.bwambale@retrac.ug');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) navigate('/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demos = [
    { key: 'caseworker', name: 'Bwambale', role: 'Caseworker' },
    { key: 'caseworker_sarah', name: 'Sarah', role: 'Caseworker' },
    { key: 'admin', name: 'Stanley', role: 'Admin' },
    { key: 'employer', name: 'Kampala Skills', role: 'Employer' },
  ];

  return (
    <div className="min-h-screen bg-[#07111a] flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="" className="w-10 h-10" />
          <span className="text-3xl font-extrabold text-white">Re<span className="text-teal-400">Trac</span></span>
        </Link>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-3xl p-7 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Email" />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#082f49] hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {demos.map((d) => (
              <button key={d.key} type="button" onClick={() => handleQuick(d.key)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-left flex items-center gap-2">
                <Avatar name={d.name} size="sm" />
                <div>
                  <p className="text-xs font-bold">{d.name}</p>
                  <p className="text-[10px] text-slate-500">{d.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
