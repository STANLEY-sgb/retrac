import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Download, RefreshCw } from 'lucide-react';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      if (res.success && res.data) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleCsvExport = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  if (loading) return <LoadingSkeleton type="card" count={4} />;

  const kpi = data?.kpi || {};
  const weeklyTrend = data?.weeklyTrend || [];
  const riskDistribution = data?.riskDistribution || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Clinical & Impact Reports</h1>
          <p className="text-xs text-slate-500 mt-1">Evidence-based recovery metrics for programme evaluation and donor reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchReports} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleCsvExport} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Enrolled" value={kpi.totalClients || 0} icon={TrendingUp} color="blue" />
        <StatCard title="Stable Clients" value={kpi.stable || 0} icon={TrendingUp} color="emerald" />
        <StatCard title="Check-in Rate" value={`${kpi.checkinComplianceRate || 0}%`} icon={TrendingUp} color="teal" />
        <StatCard title="Retention Rate" value={`${kpi.retentionRate || 0}%`} icon={TrendingUp} color="sky" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Interventions" value={kpi.totalInterventions || 0} icon={TrendingUp} color="purple" />
        <StatCard title="Jobs Placed" value={kpi.placements || 0} icon={TrendingUp} color="amber" />
        <StatCard title="Total Disbursed" value={`UGX ${Math.round((kpi.totalDisbursed || 0) / 1000)}K`} icon={TrendingUp} color="emerald" />
        <StatCard title="Alerts Resolved" value={kpi.alertsResolved || 0} icon={TrendingUp} color="teal" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Check-in Compliance Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Weekly SMS Check-in Compliance</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Line type="monotone" dataKey="compliance_rate" name="Compliance %" stroke="#0d9488" strokeWidth={3} dot={{ fill: '#0d9488', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Over Time */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Risk Level Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="level" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" name="Clients" radius={[0, 4, 4, 0]} fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Programme Summary Table */}
      {data?.summaryTable && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Caseworker Performance Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Caseworker</th>
                  <th className="py-3.5 px-4">Active Clients</th>
                  <th className="py-3.5 px-4">Critical Clients</th>
                  <th className="py-3.5 px-4">Interventions</th>
                  <th className="py-3.5 px-4">Compliance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {data.summaryTable.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{row.caseworker_name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{row.active_clients}</td>
                    <td className="py-3.5 px-4 text-rose-700 font-bold">{row.critical_clients}</td>
                    <td className="py-3.5 px-4 text-teal-700">{row.total_interventions}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${row.compliance_rate || 0}%` }} />
                        </div>
                        <span className="font-bold text-slate-800">{row.compliance_rate || 0}%</span>
                      </div>
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
