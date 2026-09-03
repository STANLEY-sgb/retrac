import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Download, Briefcase, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/ui/Avatar';
import PageHeader from '../components/ui/PageHeader';
import { riskTone } from '../lib/visual';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sortBy, setSortBy] = useState('highest_risk');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (riskFilter) queryParams.append('riskLevel', riskFilter);
      if (sortBy) queryParams.append('sort', sortBy);
      const res = await api.get(`/clients?${queryParams.toString()}`);
      if (res.success && res.data) setClients(res.data.clients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [statusFilter, riskFilter, sortBy]);

  const handleExportCsv = () => {
    const token = localStorage.getItem('retrac_token');
    const url = `${api.defaults.baseURL}/reports/export-csv${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Clients"
        actions={
          <>
            <button onClick={handleExportCsv} className="p-2.5 rounded-xl bg-white border border-slate-200"><Download className="w-4 h-4" /></button>
            <Link to="/clients/new" className="px-3.5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Enroll
            </Link>
          </>
        }
      />

      <form onSubmit={(e) => { e.preventDefault(); fetchClients(); }} className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
        </div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
          <option value="">All</option>
          <option value="CRITICAL">Critical</option>
          <option value="AT_RISK">At Risk</option>
          <option value="MONITOR">Monitor</option>
          <option value="STABLE">Stable</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
          <option value="">Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="lost_contact">Lost</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
          <option value="highest_risk">Highest risk</option>
          <option value="lowest_risk">Lowest risk</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </select>
      </form>

      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : clients.length === 0 ? (
        <EmptyState icon={Users} title="No clients" actionLabel="Enroll" onAction={() => navigate('/clients/new')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => {
            const tone = riskTone(client.current_risk_level, client.current_risk_score);
            return (
              <Link key={client.id} to={`/clients/${client.id}`} className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.full_name} />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{client.full_name}</p>
                      <StatusBadge status={client.current_risk_level} size="sm" />
                    </div>
                  </div>
                  <span className={`text-lg font-extrabold ${tone.text}`}>{client.current_risk_score}</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${tone.bar}`} style={{ width: `${Math.max(4, client.current_risk_score)}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {client.location}</span>
                  <span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {client.preferred_job_category || 'Open'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
