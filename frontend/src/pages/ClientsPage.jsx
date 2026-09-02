import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Phone,
  MapPin,
  Building,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function ClientsPage() {
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
      if (res.success && res.data) {
        setClients(res.data.clients);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter, riskFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClients();
  };

  const handleExportCsv = () => {
    window.open(`${api.defaults.baseURL}/reports/export-csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Client Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enrolled patients, recovery trajectory tracking, and caseworker assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <Link
            to="/clients/new"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Client</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, centre, or location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">All Risk Levels</option>
              <option value="CRITICAL">🔴 Critical (75-100)</option>
              <option value="AT_RISK">🟠 At Risk (50-74)</option>
              <option value="MONITOR">🟡 Monitor (30-49)</option>
              <option value="STABLE">🟢 Stable (0-29)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">All Enrollment Statuses</option>
              <option value="active">Active Monitoring</option>
              <option value="completed">Completed Reintegration</option>
              <option value="lost_contact">Lost Contact</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="highest_risk">Sort: Highest Risk First</option>
              <option value="lowest_risk">Sort: Lowest Risk First</option>
              <option value="newest">Sort: Newly Enrolled</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </form>
      </div>

      {/* Clients Table / Cards */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients match your filter"
          description="Try adjusting your search keywords or clear the active risk filter."
          actionLabel="Enroll Patient"
          onAction={() => window.location.href = '/clients/new'}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Patient</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Risk Status</th>
                  <th className="py-3.5 px-4">Treatment Centre</th>
                  <th className="py-3.5 px-4">Skills</th>
                  <th className="py-3.5 px-4">Caseworker</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                          {client.full_name.charAt(0)}
                        </div>
                        <div>
                          <Link to={`/clients/${client.id}`} className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {client.full_name}
                          </Link>
                          <div className="flex items-center gap-2 text-3xs text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{client.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-700">
                      {client.phone_number}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={client.current_risk_level} size="sm" />
                        <span className="font-bold text-slate-700 text-xs">{client.current_risk_score}/100</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[160px]">{client.treatment_centre}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {client.skills && client.skills.length > 0 ? (
                          client.skills.slice(0, 2).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-3xs font-medium">
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-3xs italic">No skills tagged</span>
                        )}
                        {client.skills && client.skills.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-3xs font-bold">
                            +{client.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <span className="font-medium">{client.caseworker_name || 'Unassigned'}</span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/clients/${client.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition-colors text-xs"
                      >
                        View Profile <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
