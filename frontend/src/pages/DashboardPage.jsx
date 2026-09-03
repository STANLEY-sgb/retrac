import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, ShieldCheck, AlertTriangle, AlertOctagon, Smartphone, Plus, UserCheck,
  RefreshCw, Briefcase, Wallet, MessageSquare, Building2, CheckCircle2,
  ArrowUpRight, Clock, ShieldAlert, HeartHandshake, ChevronRight, Check, DollarSign
} from 'lucide-react';
import api from '../api/client';
import KpiTile from '../components/ui/KpiTile';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import ActiveAlertsBanner from '../components/dashboard/ActiveAlertsBanner';
import RecoveryDistributionChart from '../components/dashboard/RecoveryDistributionChart';
import WeeklyTrendChart from '../components/dashboard/WeeklyTrendChart';
import LiveActivityFeed from '../components/dashboard/LiveActivityFeed';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import { formatUgx } from '../lib/visual';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.success && res.data) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="stat" count={5} />
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  const effectiveRole = data?.role || user?.role || 'caseworker';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  // ============================================================================
  // 1. EMPLOYER PARTNER DASHBOARD VIEW
  // ============================================================================
  if (effectiveRole === 'employer') {
    const empData = data?.employerDashboard || {};
    const empStats = empData.stats || {};
    const employerInfo = empData.employer || {};
    const activeJobs = empData.activeJobs || [];
    const recentApps = empData.recentApplications || [];
    const recentPayments = empData.recentPayments || [];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <PageHeader
          title={`${greet}, ${employerInfo.contact_person ? employerInfo.contact_person.split(' ')[0] : firstName}`}
          subtitle={`${employerInfo.company_name || 'Partner Employer'} â€¢ Inclusive Reintegration Partner`}
          actions={
            <>
              <button
                onClick={() => { setRefreshing(true); fetchDashboard(); }}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                to="/demo/payment"
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Wallet className="w-4 h-4" /> MoMo Disburse
              </Link>
              <Link
                to="/jobs/new"
                className="px-3.5 py-2.5 rounded-xl bg-[#082f49] hover:bg-[#0c4a6e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Post Vacancy
              </Link>
            </>
          }
        />

        {/* Employer KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiTile
            icon={Briefcase}
            value={empStats.openJobs ?? activeJobs.filter(j => j.status === 'open').length}
            label="Open Vacancies"
            tone="navy"
            onClick={() => navigate('/jobs')}
          />
          <KpiTile
            icon={Users}
            value={empStats.totalApplications ?? recentApps.length}
            label="Candidate Matches"
            tone="teal"
            onClick={() => navigate('/job-matches')}
          />
          <KpiTile
            icon={UserCheck}
            value={empStats.hired ?? recentApps.filter(a => a.status === 'accepted' || a.status === 'completed').length}
            label="Hired Workers"
            tone="emerald"
            onClick={() => navigate('/jobs')}
          />
          <KpiTile
            icon={CheckCircle2}
            value={empStats.completed ?? recentApps.filter(a => a.status === 'completed').length}
            label="Shifts Completed"
            tone="amber"
            onClick={() => navigate('/jobs')}
          />
          <KpiTile
            icon={Wallet}
            value={formatUgx(empStats.totalPaid ?? 0)}
            label="Total Wages Paid"
            tone="emerald"
            onClick={() => navigate('/payments')}
          />
        </div>

        {/* Main Content Grid: Candidate Pipeline & Active Vacancies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matched Candidate Applications (Privacy Protected) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  Candidate Applications & Match Triage
                </h2>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Privacy-protected candidate profiles matched by ReTrac skills algorithm
                </p>
              </div>
              <Link to="/job-matches" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No active candidate applications yet. Candidates will appear here as caseworkers match recovering clients.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApps.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{app.candidate_name || 'Candidate'}</span>
                          <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
                            {app.match_score}% Match
                          </span>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Applied for: <span className="font-semibold text-slate-800">{app.job_title}</span> â€¢ {app.candidate_location || 'Kampala Area'}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(app.skills || ['General Assistance']).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          to={`/jobs/${app.job_id}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Review Vacancy
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Job Openings & Payouts Column */}
          <div className="space-y-6">
            {/* Active Vacancies */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#082f49]" /> Active Vacancies
                </h3>
                <Link to="/jobs" className="text-2xs font-bold text-teal-700 hover:text-teal-800">
                  Manage
                </Link>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto custom-scrollbar">
                {activeJobs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No vacancies currently posted</div>
                ) : (
                  activeJobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{job.title}</p>
                          <p className="text-2xs text-slate-500 mt-0.5">{job.location}</p>
                        </div>
                        <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {formatUgx(job.pay_amount)}/day
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-2xs text-slate-500">
                        <span>{job.applicant_count || 0} applicant{job.applicant_count === 1 ? '' : 's'}</span>
                        <Link to={`/jobs/${job.id}`} className="text-teal-700 font-semibold hover:underline">
                          View details â†’
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent MoMo Payouts */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Recent Payouts
                </h3>
                <Link to="/payments" className="text-2xs font-bold text-teal-700 hover:text-teal-800">
                  Ledger
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recentPayments.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No disbursements recorded yet</div>
                ) : (
                  recentPayments.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-3 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{p.job_title || 'Work Milestone'}</p>
                        <p className="text-2xs font-mono text-slate-400">{p.transaction_reference}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700">{formatUgx(p.amount)}</span>
                        <p className="text-[10px] text-emerald-600 font-medium">Delivered</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. CLINICAL AFTERCARE & ADMIN DASHBOARD VIEW
  // ============================================================================
  const cards = data?.cards || {};
  const caseworkerWorkload = data?.caseworkerWorkload || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${greet}, ${firstName}`}
        subtitle="Recovery oversight, risk monitoring & employment reintegration"
        actions={
          <>
            <button
              onClick={() => { setRefreshing(true); fetchDashboard(); }}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/demo/sms" className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
              <Smartphone className="w-4 h-4" /> 2G SMS Simulator
            </Link>
            <Link to="/clients/new" className="px-3.5 py-2.5 rounded-xl bg-[#082f49] hover:bg-[#0c4a6e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
              <Plus className="w-4 h-4" /> Enroll Patient
            </Link>
          </>
        }
      />

      {/* Active Clinical Relapse Alerts */}
      <ActiveAlertsBanner alerts={data?.activeAlerts || []} />

      {/* Primary Clinical Risk Distribution KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile icon={Users} value={cards.totalClients || 0} label="Total Clients" tone="navy" onClick={() => navigate('/clients')} />
        <KpiTile icon={ShieldCheck} value={cards.stable || 0} label="Stable (0-29)" tone="emerald" onClick={() => navigate('/clients?riskLevel=STABLE')} />
        <KpiTile icon={AlertTriangle} value={cards.monitor || 0} label="Monitor (30-49)" tone="amber" onClick={() => navigate('/clients?riskLevel=MONITOR')} />
        <KpiTile icon={AlertTriangle} value={cards.atRisk || 0} label="At Risk (50-74)" tone="orange" onClick={() => navigate('/risk-alerts')} />
        <KpiTile icon={AlertOctagon} value={cards.critical || 0} label="Critical (75-100)" tone="rose" onClick={() => navigate('/risk-alerts')} />
      </div>

      {/* Check-ins, Reintegration & Mobile Money Placements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiTile icon={MessageSquare} value={`${cards.receivedCheckins || 0} / ${cards.missedCheckins || 0}`} label="2G Check-ins (Rx / Missed)" tone="teal" onClick={() => navigate('/check-ins')} />
        <KpiTile icon={Briefcase} value={cards.placementsCount || 0} label="Jobs Placed" tone="slate" onClick={() => navigate('/jobs')} />
        <KpiTile icon={Wallet} value={formatUgx(cards.totalDisbursed || 0)} label="MoMo Disbursed" tone="emerald" onClick={() => navigate('/payments')} />
      </div>

      {/* Recovery Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RecoveryDistributionChart data={data?.charts?.recoveryDistribution || []} />
        <div className="lg:col-span-2">
          <WeeklyTrendChart data={data?.charts?.weeklyTrend || []} />
        </div>
      </div>

      {/* Admin Specific: Staff Caseload & Performance Table */}
      {effectiveRole === 'admin' && caseworkerWorkload.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Staff Caseloads & Response Performance (Admin Oversight)
              </h2>
              <p className="text-2xs text-slate-500 mt-0.5">
                Monitoring active caseloads, emergency alert counts, and intervention follow-ups across caseworkers
              </p>
            </div>
            <Link to="/admin/users" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Manage Staff Users â†’
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-6">Caseworker</th>
                  <th className="py-3 px-4">Title & Org</th>
                  <th className="py-3 px-4 text-center">Active Caseload</th>
                  <th className="py-3 px-4 text-center">Open Alerts</th>
                  <th className="py-3 px-4 text-center">Interventions Done</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseworkerWorkload.map((cw) => (
                  <tr key={cw.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#082f49] text-teal-400 font-bold flex items-center justify-center text-xs">
                        {cw.full_name ? cw.full_name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      {cw.full_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-semibold">{cw.title}</div>
                      <div className="text-2xs text-slate-400">{cw.organization}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-sky-50 text-sky-800 border border-sky-200">
                        {cw.client_count || 0} clients
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${cw.active_alerts > 0 ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {cw.active_alerts || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {cw.intervention_count || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Operational Activity Stream */}
      <LiveActivityFeed feed={data?.liveFeed || {}} />
    </div>
  );
}

