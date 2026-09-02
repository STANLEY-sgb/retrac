import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  MessageSquare,
  Briefcase,
  CreditCard,
  Plus,
  Smartphone,
  RefreshCw,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import api from '../api/client';
import StatCard from '../components/common/StatCard';
import ActiveAlertsBanner from '../components/dashboard/ActiveAlertsBanner';
import RecoveryDistributionChart from '../components/dashboard/RecoveryDistributionChart';
import WeeklyTrendChart from '../components/dashboard/WeeklyTrendChart';
import LiveActivityFeed from '../components/dashboard/LiveActivityFeed';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="stat" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" count={2} />
          <LoadingSkeleton type="card" count={2} />
        </div>
      </div>
    );
  }

  const cards = data?.cards || {};

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Caseworker Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time recovery monitoring &bull; SMS check-in intelligence &bull; Uganda Aftercare Network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/demo/sms"
            className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>SMS Simulator</span>
          </Link>

          <Link
            to="/clients/new"
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Patient</span>
          </Link>
        </div>
      </div>

      {/* Critical Alert Banner if any patients are CRITICAL / AT RISK */}
      <ActiveAlertsBanner alerts={data?.activeAlerts || []} />

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Clients"
          value={cards.totalClients || 0}
          subtitle="Enrolled in ReTrac"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Stable Clients"
          value={cards.stable || 0}
          subtitle="Score 0 – 29"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Monitoring"
          value={cards.monitor || 0}
          subtitle="Score 30 – 49"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="At Risk"
          value={cards.atRisk || 0}
          subtitle="Score 50 – 74"
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Critical Alerts"
          value={cards.critical || 0}
          subtitle="Score 75 – 100"
          icon={AlertOctagon}
          color="rose"
        />
      </div>

      {/* Secondary Row: Check-ins & Employment Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Check-in Compliance</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {cards.receivedCheckins || 0} Received / {cards.missedCheckins || 0} Missed
            </h4>
            <p className="text-2xs text-emerald-600 font-semibold mt-0.5">&uarr; 91% Weekly Response Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Active Work Placements</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {cards.placementsCount || 0} Placed ({cards.openJobs || 0} Openings)
            </h4>
            <Link to="/job-matches" className="text-2xs text-blue-600 font-semibold hover:underline mt-0.5 block">
              Match clients to jobs &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Total Mobile Money Disbursed</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">
              UGX {Number(cards.totalDisbursed || 0).toLocaleString()}
            </h4>
            <p className="text-2xs text-slate-500 mt-0.5">Via MTN MoMo & Airtel Money</p>
          </div>
        </div>
      </div>

      {/* Visual Charts & Live Event Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecoveryDistributionChart data={data?.charts?.recoveryDistribution || []} />
        </div>
        <div className="lg:col-span-2">
          <WeeklyTrendChart data={data?.charts?.weeklyTrend || []} />
        </div>
      </div>

      {/* Live Activity Feed */}
      <LiveActivityFeed feed={data?.liveFeed || {}} />
    </div>
  );
}
