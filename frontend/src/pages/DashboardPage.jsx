import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ShieldCheck, AlertTriangle, AlertOctagon, Smartphone, Plus, RefreshCw, Briefcase, Wallet, MessageSquare } from 'lucide-react';
import api from '../api/client';
import KpiTile from '../components/ui/KpiTile';
import PageHeader from '../components/ui/PageHeader';
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

  const cards = data?.cards || {};
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={`${greet}, ${firstName}`}
        actions={
          <>
            <button onClick={() => { setRefreshing(true); fetchDashboard(); }} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/demo/sms" className="px-3 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> SMS
            </Link>
            <Link to="/clients/new" className="px-3 py-2.5 rounded-xl bg-[#082f49] text-white text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Enroll
            </Link>
          </>
        }
      />

      <ActiveAlertsBanner alerts={data?.activeAlerts || []} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile icon={Users} value={cards.totalClients || 0} label="Clients" tone="navy" onClick={() => navigate('/clients')} />
        <KpiTile icon={ShieldCheck} value={cards.stable || 0} label="Stable" tone="emerald" onClick={() => navigate('/clients')} />
        <KpiTile icon={AlertTriangle} value={cards.monitor || 0} label="Monitoring" tone="amber" onClick={() => navigate('/clients')} />
        <KpiTile icon={AlertTriangle} value={cards.atRisk || 0} label="At Risk" tone="orange" onClick={() => navigate('/risk-alerts')} />
        <KpiTile icon={AlertOctagon} value={cards.critical || 0} label="Critical" tone="rose" onClick={() => navigate('/risk-alerts')} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <KpiTile icon={MessageSquare} value={`${cards.receivedCheckins || 0}/${cards.missedCheckins || 0}`} label="Check-ins" tone="teal" onClick={() => navigate('/check-ins')} />
        <KpiTile icon={Briefcase} value={cards.placementsCount || 0} label="Placed" tone="slate" onClick={() => navigate('/jobs')} />
        <KpiTile icon={Wallet} value={formatUgx(cards.totalDisbursed || 0)} label="Paid" tone="emerald" onClick={() => navigate('/payments')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RecoveryDistributionChart data={data?.charts?.recoveryDistribution || []} />
        <div className="lg:col-span-2">
          <WeeklyTrendChart data={data?.charts?.weeklyTrend || []} />
        </div>
      </div>

      <LiveActivityFeed feed={data?.liveFeed || {}} />
    </div>
  );
}
