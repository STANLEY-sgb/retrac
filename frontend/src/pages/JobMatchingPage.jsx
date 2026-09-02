import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, Briefcase, Star, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import api from '../api/client';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import StatusBadge from '../components/common/StatusBadge';
import { useNotifications } from '../context/NotificationContext';

export default function JobMatchingPage() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [applying, setApplying] = useState(null);
  const { addToast } = useNotifications();

  useEffect(() => {
    api.get('/clients?limit=100').then(res => {
      if (res.success) setClients(res.data.clients || []);
    }).catch(console.error);
  }, []);

  const handleSelectClient = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    setMatches([]);
    if (!clientId) return;
    setMatchLoading(true);
    try {
      const res = await api.get(`/jobs/match/${clientId}`);
      if (res.success && res.data) {
        setMatches(res.data.matches || res.data);
      }
    } catch (err) {
      addToast('Error', 'Failed to compute job matches.', 'danger');
    } finally {
      setMatchLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!selectedClient) return;
    setApplying(jobId);
    try {
      const res = await api.post('/applications', { client_id: selectedClient.id, job_id: jobId });
      if (res.success) {
        addToast('Application Submitted', `${selectedClient.full_name} has been applied to this position.`, 'success');
      }
    } catch (err) {
      addToast('Error', err.message || 'Application failed', 'danger');
    } finally {
      setApplying(null);
    }
  };

  const scoreBar = (score) => {
    const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-teal-500' : score >= 25 ? 'bg-amber-400' : 'bg-slate-300';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs font-black text-slate-800 w-8 text-right">{score}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-teal-500" />
          Automated Job Matching Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Weighted scoring: 60% Skills Match + 20% Location + 20% Job Category Preference
        </p>
      </div>

      {/* Client Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Client to Match Jobs For:
        </label>
        <select
          onChange={(e) => handleSelectClient(e.target.value)}
          className="w-full sm:w-96 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">— Choose a Client —</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.full_name} ({c.current_risk_level}) — {c.location}
            </option>
          ))}
        </select>

        {selectedClient && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white font-black flex items-center justify-center text-sm">
              {selectedClient.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-teal-900">{selectedClient.full_name}</p>
              <p className="text-teal-700">{selectedClient.location} &bull; Skills: {(selectedClient.skills || []).map(s => s.name).join(', ') || 'None tagged'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Matches Grid */}
      {matchLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      )}

      {!matchLoading && matches.length > 0 && (
        <>
          <p className="text-xs font-bold text-slate-700">
            Found <span className="text-teal-600">{matches.length}</span> recommended jobs for {selectedClient?.full_name}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {matches.map((match, idx) => (
              <div key={match.job_id || idx} className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md p-5 shadow-xs transition-all flex flex-col">
                {/* Match Score Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-xl font-black ${match.total_score >= 75 ? 'text-emerald-600' : match.total_score >= 50 ? 'text-teal-600' : 'text-amber-600'}`}>
                    {match.total_score}%
                  </span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 text-2xs font-black flex items-center gap-1">
                      <Star className="w-3 h-3" /> Best Match
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-tight">{match.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">{match.employer_name}</p>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{match.location}</div>
                  <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold text-emerald-700">UGX {Number(match.pay_amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                  <div>
                    <span className="text-slate-500 text-2xs">Skills Match (60%)</span>
                    {scoreBar(match.skills_score)}
                  </div>
                  <div>
                    <span className="text-slate-500 text-2xs">Location (20%)</span>
                    {scoreBar(match.location_score)}
                  </div>
                  <div>
                    <span className="text-slate-500 text-2xs">Category (20%)</span>
                    {scoreBar(match.category_score)}
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <Link to={`/jobs/${match.job_id}`} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold text-center hover:bg-slate-50">
                    View Job
                  </Link>
                  <button
                    onClick={() => handleApply(match.job_id)}
                    disabled={applying === match.job_id}
                    className="flex-1 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center disabled:opacity-50"
                  >
                    {applying === match.job_id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!matchLoading && selectedClient && matches.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">No jobs matched for {selectedClient.full_name}</p>
          <p className="text-xs text-slate-400 mt-1">Try adding skills to the client profile or posting new matching jobs.</p>
        </div>
      )}
    </div>
  );
}
