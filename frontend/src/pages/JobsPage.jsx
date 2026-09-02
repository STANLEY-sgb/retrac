import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, MapPin, DollarSign, Users, Filter, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      const res = await api.get(`/jobs?${params}`);
      if (res.success && res.data) {
        setJobs(res.data.jobs || res.data);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [categoryFilter]);

  const categories = ['Logistics & Retail', 'Facility Maintenance', 'Agriculture', 'Hospitality & Catering', 'Automotive Services', 'Manufacturing', 'Office Administration', 'Trades & Repairs', 'Personal Care'];

  const frequencyLabel = { daily: '/day', weekly: '/week', monthly: '/month', per_job: '/job', hourly: '/hr' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Reintegration Jobs Board</h1>
          <p className="text-xs text-slate-500 mt-1">Vetted employment opportunities for recovering clients in Uganda</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchJobs} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/jobs/new" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!categoryFilter ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${categoryFilter === cat ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="No reintegration jobs match the current filter." actionLabel="Post New Job" onAction={() => window.location.href = '/jobs/new'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md p-5 shadow-xs transition-all group block"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.employer_name}</p>
                </div>
                <StatusBadge status={job.status || 'open'} size="sm" />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold text-emerald-700">
                    UGX {Number(job.pay_amount).toLocaleString()}{frequencyLabel[job.pay_frequency] || ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.applicant_count || 0} applicants</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-2xs font-semibold">
                  {job.preferred_job_category || job.category || 'General'}
                </span>
                <span className="text-xs text-blue-600 font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
