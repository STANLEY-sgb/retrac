import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, RefreshCw } from 'lucide-react';
import api from '../api/client';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function EmployersPage() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employers');
      if (res.success && res.data) {
        setEmployers(res.data.employers || res.data);
      }
    } catch (err) {
      console.error('Failed to load employers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployers(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Employer Partners</h1>
          <p className="text-xs text-slate-500 mt-1">Vetted organisations offering reintegration employment opportunities</p>
        </div>
        <button onClick={fetchEmployers} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : employers.length === 0 ? (
        <EmptyState icon={Building2} title="No employer partners registered" description="Partner employers will appear here once they register via the employer portal." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employers.map(emp => (
            <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md p-5 shadow-xs transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-black flex items-center justify-center text-xl flex-shrink-0">
                  {emp.company_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{emp.company_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{emp.industry}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                {emp.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.location}</span>
                  </div>
                )}
                {emp.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${emp.contact_email}`} className="text-blue-600 hover:underline">{emp.contact_email}</a>
                  </div>
                )}
                {emp.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{emp.contact_phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400">Posted Jobs</p>
                  <p className="font-black text-slate-900 text-base">{emp.job_count || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400">Clients Placed</p>
                  <p className="font-black text-emerald-700 text-base">{emp.placement_count || 0}</p>
                </div>
                <div>
                  <p className="text-slate-400">Total Disbursed</p>
                  <p className="font-black text-teal-700 text-base">
                    {emp.total_disbursed ? `${Math.round(Number(emp.total_disbursed) / 1000)}K` : '0'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
