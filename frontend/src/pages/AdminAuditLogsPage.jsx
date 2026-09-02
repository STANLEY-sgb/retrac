import React, { useState, useEffect } from 'react';
import { Search, Shield, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/client';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await api.get(`/admin/audit-logs?${params}`);
      if (res.success && res.data) setLogs(res.data.logs || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColor = {
    CREATE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    UPDATE: 'bg-sky-50 text-sky-800 border-sky-200',
    DELETE: 'bg-red-50 text-red-800 border-red-200',
    LOGIN: 'bg-blue-50 text-blue-800 border-blue-200',
    PAYMENT: 'bg-teal-50 text-teal-800 border-teal-200',
    RISK_UPDATE: 'bg-orange-50 text-orange-800 border-orange-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Immutable Audit Log</h1>
          <p className="text-xs text-slate-500 mt-1">Tamper-proof chronological record of all system actions and data changes</p>
        </div>
        <button onClick={fetchLogs} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={(e) => { e.preventDefault(); fetchLogs(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, resource, user, or metadata..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">Search</button>
        </form>
      </div>

      {loading ? <LoadingSkeleton type="table" count={8} /> : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Actor / User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource</th>
                  <th className="py-3.5 px-4">Resource ID</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-2xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{log.user_name || log.user_id || 'System'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-lg border text-2xs font-black ${actionColor[log.action] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 capitalize">{(log.resource_type || '').replace('_', ' ')}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-2xs">{log.resource_id?.substring(0, 8) || '—'}...</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-2xs">{log.ip_address || '—'}</td>
                      <td className="py-3.5 px-4">
                        {log.metadata ? (
                          <button
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                            className="flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                          >
                            View JSON {expandedId === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id && log.metadata && (
                      <tr>
                        <td colSpan={7} className="px-6 pb-4 pt-0 bg-slate-50">
                          <pre className="text-2xs font-mono bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto border border-slate-800">
                            {JSON.stringify(typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
