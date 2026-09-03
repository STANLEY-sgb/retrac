import React from 'react';
import { MessageSquare, HeartHandshake, Wallet, Clock } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function LiveActivityFeed({ feed = {} }) {
  const allEvents = [
    ...(feed.sms || []).map((s) => ({
      id: s.id,
      type: 'sms',
      title: s.client_name || s.phone_number,
      meta: s.message_text,
      time: s.created_at,
      icon: MessageSquare,
      color: 'text-sky-600 bg-sky-50'
    })),
    ...(feed.interventions || []).map((i) => ({
      id: i.id,
      type: 'care',
      title: i.client_name,
      meta: (i.type || '').replace('_', ' '),
      time: i.created_at,
      icon: HeartHandshake,
      color: 'text-teal-600 bg-teal-50'
    })),
    ...(feed.payments || []).map((p) => ({
      id: p.id,
      type: 'pay',
      title: p.client_name,
      meta: `UGX ${Number(p.amount).toLocaleString()}`,
      time: p.created_at,
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-50'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Live</p>
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {allEvents.length === 0 ? (
          <EmptyState title="Quiet" />
        ) : (
          allEvents.slice(0, 10).map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={event.id || idx} className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${event.color}`}><Icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{event.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{event.meta}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
