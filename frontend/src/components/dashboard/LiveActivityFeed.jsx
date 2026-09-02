import React from 'react';
import { MessageSquare, HeartHandshake, CreditCard, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveActivityFeed({ feed = {} }) {
  const smsItems = feed.sms || [];
  const intvItems = feed.interventions || [];
  const payItems = feed.payments || [];

  // Combine and sort chronologically
  const allEvents = [
    ...smsItems.map(s => ({
      id: s.id,
      type: 'sms',
      title: `${s.client_name || s.phone_number} ${s.direction === 'inbound' ? 'replied' : 'was sent check-in'}: "${s.message_text}"`,
      time: s.created_at,
      icon: MessageSquare,
      color: s.direction === 'inbound' && s.message_text.includes('2') ? 'text-rose-600 bg-rose-50' : 'text-sky-600 bg-sky-50'
    })),
    ...intvItems.map(i => ({
      id: i.id,
      type: 'intervention',
      title: `Caseworker recorded ${i.type.replace('_', ' ')} with ${i.client_name}: ${i.description}`,
      time: i.created_at,
      icon: HeartHandshake,
      color: 'text-teal-600 bg-teal-50'
    })),
    ...payItems.map(p => ({
      id: p.id,
      type: 'payment',
      title: `Mobile money payout ${p.transaction_reference} of UGX ${Number(p.amount).toLocaleString()} disbursed to ${p.client_name}`,
      time: p.created_at,
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50'
    }))
  ];

  allEvents.sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="text-sm font-bold text-slate-900">Live System Activity Feed</h4>
        </div>
        <span className="text-2xs text-slate-400 font-medium">Real-time event stream</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1 divide-y divide-slate-100">
        {allEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">No recent activity logged yet.</p>
        ) : (
          allEvents.slice(0, 10).map((event, idx) => {
            const Icon = event.icon;
            const timeStr = new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={event.id || idx} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                <div className={`p-2 rounded-xl flex-shrink-0 ${event.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-medium leading-relaxed">{event.title}</p>
                  <div className="flex items-center gap-2 text-3xs text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeStr}</span>
                    <span>•</span>
                    <span className="capitalize">{event.type}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
