import React, { useState, useEffect, useRef } from 'react';
import {
  Signal,
  Battery,
  Phone,
  PhoneOff,
  CornerDownLeft,
  Delete,
  MessageSquare,
  CreditCard,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function FeaturePhoneSimulator({
  client,
  network = 'MTN',
  messages = [],
  currentInput = '',
  onInputChange = () => {},
  onSend = () => {},
  sending = false,
  onReset = null
}) {
  const [viewState, setViewState] = useState('CONVERSATION'); // 'CONVERSATION' | 'INBOX' | 'MENU'
  const [currentTime, setCurrentTime] = useState('');
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const chatBottomRef = useRef(null);

  // Time formatted in Africa/Kampala style
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom when conversation messages change
  useEffect(() => {
    if (viewState === 'CONVERSATION') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, viewState]);

  // Flash new alert on incoming message
  useEffect(() => {
    if (messages.length > 0) {
      setHasNewAlert(true);
      const timer = setTimeout(() => setHasNewAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleKeyClick = (val) => {
    if (val === 'DEL') {
      onInputChange(currentInput.slice(0, -1));
    } else if (val === 'SPACE') {
      onInputChange(currentInput + ' ');
    } else {
      onInputChange(currentInput + val);
    }
  };

  const clientName = client ? client.full_name : 'Client';
  const firstName = clientName.split(' ')[0];
  const clientPhone = client ? client.phone_number : '+256 772 000 000';
  const networkLabel = network === 'Airtel' ? 'Airtel UG 2G' : 'MTN UG 4G';

  // Group messages for inbox preview
  const momoMessages = messages.filter((m) =>
    (m.message_text || m.text || '').toLowerCase().includes('money') ||
    (m.message_text || m.text || '').toLowerCase().includes('received ugx') ||
    (m.message_text || m.text || '').toLowerCase().includes('momo')
  );

  const checkinMessages = messages.filter((m) =>
    !(m.message_text || m.text || '').toLowerCase().includes('received ugx')
  );

  return (
    <div className="flex flex-col items-center select-none">
      {/* Handset Body */}
      <div className="relative w-[310px] sm:w-[330px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-[3rem] p-4 pt-3 border-4 border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
        
        {/* Top Earpiece Grill */}
        <div className="flex justify-center items-center gap-1.5 mb-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div className="w-12 h-1.5 rounded-full bg-slate-800 border border-slate-700/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Outer Bezel */}
        <div className="bg-black/90 p-2.5 rounded-[1.8rem] border border-slate-800/90 shadow-inner">
          
          {/* Retro Green Backlit LCD Screen */}
          <div className="relative bg-[#07170b] text-[#7bf28d] font-mono rounded-xl border-2 border-[#12381b] overflow-hidden flex flex-col h-[320px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            
            {/* Screen Top Status Bar */}
            <div className="bg-[#0b2413] border-b border-[#184824] px-2 py-1 flex items-center justify-between text-[10px] font-bold text-[#86efac]">
              {/* Signal & Carrier */}
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-[#4ade80]" />
                <span className="tracking-tight">{networkLabel}</span>
              </div>

              {/* Time */}
              <span className="text-[10px] tracking-wider font-extrabold">{currentTime || '10:00 AM'}</span>

              {/* Battery */}
              <div className="flex items-center gap-0.5">
                <span className="text-[9px]">94%</span>
                <div className="w-4 h-2 border border-[#4ade80] rounded-xs p-[1px] flex items-center">
                  <div className="w-3/4 h-full bg-[#4ade80] rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Notification Banner if active */}
            {hasNewAlert && (
              <div className="bg-[#22c55e] text-slate-950 text-[10px] font-black px-2 py-0.5 text-center animate-pulse tracking-wide">
                🔔 NEW SMS RECEIVED
              </div>
            )}

            {/* SCREEN VIEW: CONVERSATION */}
            {viewState === 'CONVERSATION' && (
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 custom-scrollbar text-[11px] leading-relaxed">
                {/* Channel Header */}
                <div className="text-center border-b border-[#184824]/60 pb-1.5 mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#4ade80]">
                    ReTrac Aftercare
                  </p>
                </div>

                {messages.length === 0 ? (
                  <div className="bg-[#0b2413]/80 border border-[#1b5029] rounded-lg p-2.5 text-[11px] text-[#86efac]">
                    <p className="font-bold text-[#4ade80] text-[10px] mb-1">ReTrac Aftercare</p>
                    <p>How is your recovery this week?</p>
                    <p className="mt-2 text-[10px]">1 — Doing well</p>
                    <p className="text-[10px]">2 — I'm struggling</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isOutbound = m.direction === 'outbound' || m.dir === 'outbound';
                    const isMomo = (m.message_text || m.text || '').includes('received UGX') || (m.message_text || m.text || '').includes('Money');

                    if (isOutbound) {
                      // Outbound from ReTrac / Momo to patient
                      return (
                        <div
                          key={m.id || idx}
                          className={`rounded-lg p-2 text-[10.5px] border ${
                            isMomo
                              ? 'bg-[#1b3d16] border-[#388e3c] text-[#bbf7d0]'
                              : 'bg-[#0c2815] border-[#1b5029] text-[#86efac]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[9px] font-bold text-[#4ade80] mb-0.5">
                            <span>{isMomo ? '💰 MOBILE MONEY' : 'RETRAC AFTERCARE'}</span>
                            <span className="opacity-70 text-[8px]">{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.message_text || m.text}</p>
                        </div>
                      );
                    } else {
                      // Inbound reply from patient
                      return (
                        <div key={m.id || idx} className="ml-6 flex flex-col items-end">
                          <div className="bg-[#143d1a] border border-[#277038] text-white rounded-lg px-2.5 py-1.5 text-[10.5px] max-w-[90%] text-right shadow-xs">
                            <span className="text-[8px] text-[#86efac] block font-semibold mb-0.5">Your SMS Reply:</span>
                            <p className="font-bold whitespace-pre-wrap">"{m.message_text || m.text}"</p>
                          </div>
                          <span className="text-[8px] text-[#4ade80]/60 mt-0.5">
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sent'}
                          </span>
                        </div>
                      );
                    }
                  })
                )}

                {/* Live Current Draft Preview */}
                {currentInput && (
                  <div className="ml-6 flex flex-col items-end animate-pulse">
                    <div className="bg-[#1e4a25]/90 border border-[#3aa854] text-[#a7f3d0] rounded-lg px-2.5 py-1 text-[10.5px] max-w-[90%] text-right">
                      <span className="text-[8px] text-[#4ade80] block font-bold">Drafting Reply:</span>
                      <p className="font-bold">"{currentInput}"</p>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            )}

            {/* SCREEN VIEW: INBOX */}
            {viewState === 'INBOX' && (
              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar text-[11px]">
                <div className="text-center border-b border-[#184824] pb-1">
                  <span className="text-[10px] font-black uppercase text-[#4ade80]">SMS Inbox ({messages.length})</span>
                </div>

                {/* ReTrac Aftercare Thread */}
                <div
                  onClick={() => setViewState('CONVERSATION')}
                  className="bg-[#0b2413] border border-[#1b5029] rounded-lg p-2 cursor-pointer hover:bg-[#11351c] transition-colors"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#4ade80]">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> ReTrac Aftercare
                    </span>
                    <span className="text-[8.5px] text-[#86efac]/70">Today</span>
                  </div>
                  <p className="text-[9.5px] text-[#86efac] truncate mt-0.5">
                    {checkinMessages.length > 0 ? (checkinMessages[checkinMessages.length - 1].message_text || checkinMessages[checkinMessages.length - 1].text) : 'Weekly recovery check-in prompt'}
                  </p>
                </div>

                {/* Mobile Money Thread */}
                <div
                  onClick={() => setViewState('CONVERSATION')}
                  className="bg-[#0b2413] border border-[#1b5029] rounded-lg p-2 cursor-pointer hover:bg-[#11351c] transition-colors"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-amber-300">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-amber-400" /> Mobile Money
                    </span>
                    <span className="text-[8.5px] text-[#86efac]/70">{momoMessages.length > 0 ? 'Latest' : 'Active'}</span>
                  </div>
                  <p className="text-[9.5px] text-[#86efac] truncate mt-0.5">
                    {momoMessages.length > 0 ? (momoMessages[momoMessages.length - 1].message_text || momoMessages[momoMessages.length - 1].text) : 'No payment messages yet.'}
                  </p>
                </div>

                {/* Caseworker Thread */}
                <div
                  onClick={() => setViewState('CONVERSATION')}
                  className="bg-[#0b2413] border border-[#1b5029] rounded-lg p-2 cursor-pointer hover:bg-[#11351c] transition-colors"
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#4ade80]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> Caseworker Team
                    </span>
                    <span className="text-[8.5px] text-[#86efac]/70">Bwambale S.</span>
                  </div>
                  <p className="text-[9.5px] text-[#86efac] truncate mt-0.5">
                    Your assigned caseworker is monitoring your recovery score.
                  </p>
                </div>
              </div>
            )}

            {/* Screen Bottom Softkey Bar */}
            <div className="bg-[#0b2413] border-t border-[#184824] px-3 py-1 flex items-center justify-between text-[10px] font-bold text-[#86efac]">
              <button
                type="button"
                onClick={() => setViewState(viewState === 'INBOX' ? 'CONVERSATION' : 'INBOX')}
                className="hover:text-white transition-colors"
              >
                {viewState === 'INBOX' ? 'Messages' : 'Inbox'}
              </button>

              <span className="text-[8.5px] opacity-60 uppercase font-sans">Africa's Talking</span>

              <button
                type="button"
                onClick={onSend}
                disabled={sending || !currentInput}
                className="hover:text-white font-extrabold text-[#4ade80] disabled:opacity-30 transition-colors"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation & Function Keys Row */}
        <div className="mt-3.5 px-1.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setViewState(viewState === 'INBOX' ? 'CONVERSATION' : 'INBOX')}
            className="py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 text-[10px] font-black rounded-lg border border-slate-700 shadow-xs flex items-center justify-center gap-1"
            title="Toggle Inbox"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Inbox</span>
          </button>

          <button
            type="button"
            onClick={onSend}
            disabled={sending || !currentInput}
            className="py-1.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-40 text-white text-[11px] font-black rounded-lg shadow-sm flex items-center justify-center gap-1 transition-all"
            title="Transmit SMS"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>{sending ? '...' : 'Send'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleKeyClick('DEL')}
            className="py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-rose-400 text-[10px] font-black rounded-lg border border-slate-700 shadow-xs flex items-center justify-center gap-1"
            title="Delete character"
          >
            <Delete className="w-3 h-3" />
            <span>Del</span>
          </button>
        </div>

        {/* 3x4 Physical Number Keypad */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 px-1">
          {[
            { num: '1', sub: '. , !' },
            { num: '2', sub: 'ABC' },
            { num: '3', sub: 'DEF' },
            { num: '4', sub: 'GHI' },
            { num: '5', sub: 'JKL' },
            { num: '6', sub: 'MNO' },
            { num: '7', sub: 'PQRS' },
            { num: '8', sub: 'TUV' },
            { num: '9', sub: 'WXYZ' },
            { num: '*', sub: 'JOB', action: 'JOB' },
            { num: '0', sub: '␣ SPACE', action: 'SPACE' },
            { num: '#', sub: 'CLR', action: 'DEL' }
          ].map((key) => (
            <button
              key={key.num}
              type="button"
              onClick={() => {
                if (key.action === 'SPACE') handleKeyClick('SPACE');
                else if (key.action === 'DEL') handleKeyClick('DEL');
                else if (key.action === 'JOB') onInputChange('JOB');
                else handleKeyClick(key.num);
              }}
              className="bg-gradient-to-b from-slate-800 to-slate-850 hover:from-slate-700 hover:to-slate-800 active:from-slate-900 active:to-slate-950 border border-slate-700/80 rounded-xl py-2 flex flex-col items-center justify-center shadow-xs transition-colors group cursor-pointer"
            >
              <span className="text-slate-100 font-black text-sm group-hover:text-teal-400">{key.num}</span>
              <span className="text-[7.5px] font-bold text-slate-400 group-hover:text-slate-200 tracking-wider">
                {key.sub}
              </span>
            </button>
          ))}
        </div>

        {/* Phone Bottom Call / Power Keys */}
        <div className="mt-2.5 px-2 flex items-center justify-between text-slate-500 text-[8px] font-bold">
          <div className="flex items-center gap-1 text-emerald-400">
            <Phone className="w-3 h-3" />
            <span>2G USSD</span>
          </div>
          <span className="tracking-widest opacity-60">ITEL / NOKIA 105</span>
          <div className="flex items-center gap-1 text-rose-400">
            <PhoneOff className="w-3 h-3" />
            <span>END</span>
          </div>
        </div>
      </div>
    </div>
  );
}
