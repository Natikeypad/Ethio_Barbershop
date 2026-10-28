import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Users,
  UserCheck,
  Clock,
  Sparkles,
  Scissors,
  CheckCircle2,
  PlusCircle,
  AlertCircle,
  Bell,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import api from '../../utils/api';
import { BARBERS_LIST, BARBER_NAMES, getBarberById } from '../../data/barbersData';
import { useShop } from '../../contexts/ShopContext';

const DEFAULT_MOCK_QUEUE = [
  {
    id: 1,
    customerName: 'ዳዊት',
    service: 'Classic Haircut',
    barber: 'EyoB',
    position: 1,
    status: 'serving',
    joinedAt: '15 min ago',
  },
  {
    id: 2,
    customerName: 'ቴዎድሮስ',
    service: 'Fade',
    barber: 'EyoB',
    position: 2,
    status: 'waiting',
    joinedAt: '12 min ago',
  },
  {
    id: 3,
    customerName: 'ሰለሞን',
    service: 'Beard Trim',
    barber: 'Serke',
    position: 3,
    status: 'waiting',
    joinedAt: '10 min ago',
  },
  {
    id: 4,
    customerName: 'ብሩክ',
    service: 'Kids Cut',
    barber: 'Yonas',
    position: 4,
    status: 'waiting',
    joinedAt: '5 min ago',
  },
];

const AVAILABLE_SERVICES = [
  'Normal Classic Cut (280 ብር)',
  'Normal Classic Cut & Beard Trim Combo (300 ብር)',
  'Modern Fade (280 ብር)',
  'Beard Trim Only (230 ብር)',
  'Hair Line Trim (230 ብር)',
  'Coloring (300 ብር)',
  'Steam Treatment (200 ብር)',
  'Gel Styling - Jel (200 ብር)',
  'Hair Wash Only (200 ብር)',
];

const BARBER_OPTIONS = ['ማንኛውም ባርበር (Any Barber)', 'EyoB', 'Brhanu', 'Serke', 'Yonas'];

export default function QueueBoard() {
  const { queue, setQueue, addToQueue } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState(AVAILABLE_SERVICES[0]);
  const [preferredBarber, setPreferredBarber] = useState(BARBER_OPTIONS[0]);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Handle Add to Queue
  const handleAddToQueue = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFeedback({ type: 'error', message: 'እባክዎ የደንበኛውን ስም ያስገቡ (Please enter customer name)' });
      return;
    }

    setSubmitting(true);
    const newEntry = {
      id: Date.now(),
      customerName: customerName.trim(),
      service: service.split(' (')[0],
      barber: preferredBarber.includes('Any') || preferredBarber.includes('ማንኛውም') ? 'Any' : preferredBarber,
      position: queue.length + 1,
      status: queue.length === 0 ? 'serving' : 'waiting',
      joinedAt: 'Just now (አሁን)',
    };

    try {
      const res = await api.post('/queue', newEntry);
      if (res.data) {
        setQueue((prev) => [...prev, res.data]);
      } else {
        setQueue((prev) => [...prev, newEntry]);
      }
    } catch {
      // Local fallback
      setQueue((prev) => [...prev, newEntry]);
    } finally {
      setCustomerName('');
      setSubmitting(false);
      setFeedback({
        type: 'success',
        message: `ተራ ቁጥር #${newEntry.position} ለ ${newEntry.customerName} ተመዝግቧል! (Successfully added to queue)`,
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Move next customer in queue
  const handleNextInQueue = () => {
    if (queue.length === 0) return;
    setQueue((prevQueue) => {
      const remaining = prevQueue.slice(1);
      return remaining.map((item, index) => ({
        ...item,
        position: index + 1,
        status: index === 0 ? 'serving' : 'waiting',
      }));
    });
    setFeedback({
      type: 'info',
      message: 'የሚቀጥለው ደንበኛ ተጠርቷል! (Next customer called)',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const servingCustomer = queue.find((item) => item.status === 'serving');
  const waitingCustomers = queue.filter((item) => item.status !== 'serving');

  // Compute per‑barber counts (including serving and waiting)
  const barberCounts = BARBER_OPTIONS.slice(1).reduce((acc, name) => {
    const count = queue.filter((q) => q.barber === name).length;
    return { ...acc, [name]: count };
  }, {});

  // Average service duration (minutes) – fallback to 30 if unknown
  const AVERAGE_DURATION = 30;

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Ethiopian Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* Queue Hero Strip */}
      <div className="relative h-32 sm:h-40 rounded-2xl overflow-hidden">
        <img src="/images/hero-barbershop.jpg" alt="Barbershop" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-[#0a0a0f]/60" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-8">
          <div>
            <p className="text-xs text-[#fbbf24] font-ethiopic mb-1">ኢትዮ ባርበር</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              <span className="font-ethiopic">ወረፋ ሰሌዳ</span>
              <span className="text-gray-400 font-light text-lg ml-2">Queue Display</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5a623]/20 text-[#fbbf24] border border-[#f5a623]/30 font-ethiopic flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              የቀጥታ የወረፋ ሰሌዳ
            </span>
            <span className="text-xs text-gray-500">• Live Tablet Screen</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
            <span className="font-ethiopic text-gold-gradient">ወረፋ</span>
            <span className="text-gray-500 font-light text-2xl">|</span>
            <span className="text-gray-200 text-2xl font-normal tracking-wide">Queue Board</span>
          </h1>
        </div>

        {/* Queue Stats & Next Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12121a] border border-white/10">
            <span className="text-xs text-gray-400 font-ethiopic">ጠቅላላ ተረኛ፡</span>
            <span className="text-xl font-bold font-mono text-[#fbbf24]">{queue.length}</span>
          </div>

          <button
            onClick={handleNextInQueue}
            disabled={queue.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#d97706] text-[#0a0a0f] font-bold text-sm shadow-lg shadow-[#f5a623]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            id="call-next-btn"
          >
            <Bell className="w-4 h-4" />
            <span className="font-ethiopic">ቀጣይ ጥሩ</span>
            <span className="text-xs font-normal opacity-90">(Call Next)</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-slideUp ${
            feedback.type === 'success'
              ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#34d399]'
              : feedback.type === 'error'
              ? 'bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#fb7185]'
              : 'bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#60a5fa]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium font-ethiopic">{feedback.message}</span>
        </div>
      )}

      {/* Currently Serving Highlight Card */}
      {servingCustomer && (
        <div className="glass-card p-6 border-2 border-[#10b981]/50 bg-gradient-to-r from-[#10b981]/10 via-[#12121a]/90 to-[#10b981]/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[#10b981]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              {/* Serving Big Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-mono font-black text-2xl shadow-lg shadow-[#10b981]/30 shrink-0">
                #{servingCustomer.position}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/25 text-[#34d399] border border-[#10b981]/40 animate-pulse font-ethiopic">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                    ተራዎ ደርሷል! (Serving Now)
                  </span>
                  <span className="text-xs text-gray-400">• {servingCustomer.joinedAt}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-ethiopic tracking-tight">
                  {servingCustomer.customerName}
                </h3>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-300">
                  <span className="flex items-center gap-1 text-[#fbbf24]">
                    <Scissors className="w-3.5 h-3.5" />
                    {servingCustomer.service}
                  </span>
                  {servingCustomer.barber && (
                    <span className="text-gray-400">
                      Barber: <strong className="text-white">{servingCustomer.barber}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#12121a]/90 px-4 py-3 rounded-xl border border-white/10 self-start sm:self-center">
              <UserCheck className="w-5 h-5 text-[#34d399]" />
              <div className="text-left">
                <span className="text-[11px] text-gray-400 block font-ethiopic">ሁኔታ (Status)</span>
                <span className="text-xs font-bold text-white font-ethiopic">በአገልግሎት ላይ (In Chair)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Barber Queue Counts */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(barberCounts).map(([name, count]) => {
          const barberObj = getBarberById(name);
          return (
            <Link
              key={name}
              to={barberObj ? `/barber/${barberObj.slug}` : `/customer`}
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#12121a] border border-white/10 hover:border-[#f5a623]/60 hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f5a623]/15 border border-[#f5a623]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Scissors className="w-4 h-4 text-[#fbbf24]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="block text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">
                    {barberObj ? `${barberObj.nameAm} (${name})` : name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#fbbf24] group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs text-[#fbbf24] font-medium font-ethiopic">
                  {count} {count === 1 ? 'ደንበኛ በወረፋ' : 'ደንበኞች በወረፋ'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Waiting List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f5a623]" />
            <span className="font-ethiopic">በመጠበቅ ላይ ያሉ ደንበኞች</span>
            <span className="text-gray-400 text-xs font-normal">
              ({waitingCustomers.length} Waiting in Line)
            </span>
          </h2>
        </div>

        {waitingCustomers.length === 0 ? (
          <div className="glass-card p-10 text-center border border-white/5">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-base text-gray-300 font-ethiopic font-semibold">
              በአሁኑ ሰዓት የሚጠብቅ ደንበኛ የለም!
            </p>
            <p className="text-xs text-gray-500 mt-1">No customers currently waiting in queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingCustomers.map((cust, idx) => {
              const peopleAhead = cust.position - 1;
              return (
                <div
                  key={cust.id}
                  className="glass-card p-4 border border-white/10 hover:border-[#f5a623]/40 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Position Number */}
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] border border-white/10 flex items-center justify-center font-mono font-bold text-lg text-[#fbbf24] shrink-0 group-hover:scale-105 transition-transform">
                      #{cust.position}
                    </div>

                    {/* Customer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-base text-white truncate font-ethiopic group-hover:text-[#fbbf24] transition-colors">
                          {cust.customerName}
                        </h4>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-ethiopic">
                          በመጠበቅ ላይ
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-[#f5a623]" />
                          <span className="truncate">{cust.service}</span>
                        </span>
                        {cust.barber && (
                          <span className="text-[11px]">
                            • ባርበር:{' '}
                            {getBarberById(cust.barber) ? (
                              <Link
                                to={`/barber/${getBarberById(cust.barber).slug}`}
                                className="text-[#fbbf24] hover:underline font-bold"
                              >
                                {cust.barber}
                              </Link>
                            ) : (
                              <strong className="text-white">{cust.barber}</strong>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Joined: {cust.joinedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* "X ሰዎች ይቀሩዎታል" Banner */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-ethiopic text-[#fcd34d] font-semibold flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      {peopleAhead} {peopleAhead === 1 ? 'ሰው ይቀረዎታል' : 'ሰዎች ይቀሩዎታል'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">
                        ({peopleAhead} {peopleAhead === 1 ? 'person' : 'people'} ahead)
                      </span>
                      <span className="text-[10px] text-[#34d399] font-semibold font-ethiopic">
                        ≈ {peopleAhead * AVERAGE_DURATION} ደቂቃዎች
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add to Queue Bottom Form */}
      <div className="glass-card p-6 border border-[#f5a623]/20 bg-[#12121a]/95 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ethiopic font-bold text-lg text-white">
              አዲስ ደንበኛ ወደ ወረፋ ያክሉ
            </h3>
            <p className="text-xs text-gray-400">
              Walk-in Registration • Add new customer to queue
            </p>
          </div>
        </div>

        <form onSubmit={handleAddToQueue} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 font-ethiopic">
              የደንበኛ ስም <span className="text-gray-500 font-sans">(Customer Name) *</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ለምሳሌ፡ ዮናስ / Yonas"
              id="queue-customer-name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] outline-none transition-all font-ethiopic"
            />
          </div>

          {/* Service Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 font-ethiopic">
              የሚፈልጉት አገልግሎት <span className="text-gray-500 font-sans">(Service)</span>
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              id="queue-service-select"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] outline-none transition-all font-ethiopic"
            >
              {AVAILABLE_SERVICES.map((s) => (
                <option key={s} value={s} className="bg-[#12121a] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Barber */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5 font-ethiopic">
              ተመራጭ ባርበር <span className="text-gray-500 font-sans">(Preferred Barber)</span>
            </label>
            <select
              value={preferredBarber}
              onChange={(e) => setPreferredBarber(e.target.value)}
              id="queue-barber-select"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] outline-none transition-all font-ethiopic"
            >
              {BARBER_OPTIONS.map((b) => (
                <option key={b} value={b} className="bg-[#12121a] text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              id="join-queue-submit-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#d97706] text-[#0a0a0f] font-bold text-sm shadow-lg shadow-[#f5a623]/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="font-ethiopic">ወረፋ አስገባ</span>
              <span className="text-xs font-normal opacity-90">(Join Queue)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
