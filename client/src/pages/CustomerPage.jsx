import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Sparkles,
  Star,
  ChevronRight,
  Clock,
  UserCheck,
  Edit3,
  Trash2,
  Ticket,
  Search,
} from 'lucide-react';
import { getCurrentEthiopianTime } from '../utils/ethiopianTime';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';
import { BARBERS_LIST, getBarberById } from '../data/barbersData';
import { useShop } from '../contexts/ShopContext';
import QueueManageModal from '../components/Queue/QueueManageModal';

const AVERAGE_DURATION = 30; // minutes per service

export default function CustomerPage() {
  const { queue } = useShop();
  const [ethTime, setEthTime] = useState('');
  const [ethDate, setEthDate] = useState('');

  // Active ticket management
  const [managingTicket, setManagingTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLookupBox, setShowLookupBox] = useState(false);

  // Detect if current customer has an active ticket in queue
  const savedTicketId = typeof window !== 'undefined' ? localStorage.getItem('ethio_my_ticket_id') : null;
  const activeMyTicket = queue.find((q) => String(q.id) === String(savedTicketId));

  // Search results if customer wants to find their ticket by name
  const searchedTickets = searchQuery.trim()
    ? queue.filter((q) =>
        q.customerName.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  /* ── Ethiopian Clock & Calendar ── */
  useEffect(() => {
    const tick = () => {
      try {
        const t = getCurrentEthiopianTime();
        setEthTime(t.formatted);
      } catch {
        setEthTime('');
      }
      try {
        setEthDate(formatEthiopianDate(new Date()));
      } catch {
        setEthDate('');
      }
    };
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 animate-fadeIn">
      {/* ═══════════════════════════════════════════════════════════
          1. WELCOMING HERO SECTION (Simple, Clean, Warm & Spaced)
      ════════════════════════════════════════════════════════════ */}
      <section className="relative rounded-3xl overflow-hidden glass-card border border-white/10 p-8 sm:p-14 lg:p-20 bg-gradient-to-br from-[#12121a]/95 via-[#0a0a0f] to-[#12121a] text-center">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f5a623]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5a623]/15 border border-[#f5a623]/30 text-[#fbbf24] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-ethiopic">እንኳን ወደ ኢትዮ ባርበር በደህና መጡ!</span>
            <span className="opacity-80 font-sans">• Welcome to Ethio Barber</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            <span className="font-ethiopic block mb-2">ጥራት ያለው የፀጉር አገልግሎት</span>
            <span className="text-lg sm:text-2xl font-light text-gray-300 font-sans block">
              Professional Barbershop & Live Queue
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-ethiopic leading-relaxed max-w-2xl mx-auto">
            አገልግሎት ለማግኘት ከታች ከሚገኙት 4 ባለሙያ ባርበሮች አንዱን ይምረጡ። የባርበሩን የቀጥታ ወረፋ፣ የአገልግሎት ዋጋዎችን ማየት እንዲሁም ወረፋ መያዝ ወይም ቀጠሮ መያዝ ይችላሉ።
          </p>

          {/* Ethiopian & Western Clock / Date */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs text-gray-400">
            {ethTime && (
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-ethiopic text-[#fbbf24] font-bold">
                ⏰ {ethTime}
              </span>
            )}
            {ethDate && (
              <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-ethiopic text-gray-200">
                📅 {ethDate}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. CUSTOMER SUITABLE ACTIVE QUEUE TICKET (Change or Leave)
      ════════════════════════════════════════════════════════════ */}
      {activeMyTicket ? (
        <section className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-[#f5a623]/50 bg-gradient-to-r from-[#1a1500]/80 via-[#12121a] to-[#0a0a0f] shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5a623]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f5a623]/20 border border-[#f5a623]/40 text-[#fbbf24] text-xs font-bold font-ethiopic">
                <Ticket className="w-3.5 h-3.5" />
                <span>የእርስዎ የወረፋ ቲኬት (Your Active Queue Ticket)</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-white font-ethiopic flex items-center justify-center md:justify-start gap-2.5">
                  <span>{activeMyTicket.customerName}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#10b981] text-black font-sans font-bold">
                    {activeMyTicket.status === 'serving' ? 'ወንበር ላይ (Serving)' : 'በወረፋ ላይ (Waiting)'}
                  </span>
                </h3>
                <p className="text-xs text-gray-300 font-ethiopic">
                  ባርበር፡ <strong className="text-[#fbbf24]">{activeMyTicket.barber}</strong> • አገልግሎት፡{' '}
                  <strong className="text-white">{activeMyTicket.service}</strong> ({activeMyTicket.price || 280} ብር)
                </p>
              </div>
            </div>

            {/* Change Queue or Leave Queue Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setManagingTicket(activeMyTicket)}
                className="px-5 py-3 rounded-2xl bg-[#f5a623] hover:bg-[#d97706] text-black font-black text-xs sm:text-sm shadow-lg shadow-[#f5a623]/20 transition-all flex items-center gap-2 font-ethiopic cursor-pointer active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>ወረፋ ይቀይሩ (Change Barber / Service)</span>
              </button>

              <button
                onClick={() => setManagingTicket(activeMyTicket)}
                className="px-5 py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 font-ethiopic cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>ከወረፋ ውጡ (Leave Queue)</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* If no local ticket, offer a quick lookup button for customers who want to check/change their queue */
        <div className="text-center">
          <button
            onClick={() => setShowLookupBox(!showLookupBox)}
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#fbbf24] font-ethiopic transition-colors cursor-pointer py-1 px-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20"
          >
            <Search className="w-3.5 h-3.5" />
            <span>ቀድመው ወረፋ ይዘዋል? ቲኬትዎን ለመቀየር ወይም ለመውጣት እዚህ ይጫኑ</span>
          </button>

          {showLookupBox && (
            <div className="mt-4 max-w-md mx-auto glass-card p-5 rounded-2xl border border-white/10 bg-[#12121a] text-left space-y-3 animate-fadeIn">
              <h4 className="text-sm font-bold text-white font-ethiopic flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#fbbf24]" />
                ወረፋዎን በስም ይፈልጉ (Find Your Queue Ticket)
              </h4>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ስምዎን እዚህ ያስገቡ... (e.g. Dawit)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-xs sm:text-sm focus:border-[#f5a623] outline-none"
              />

              {searchQuery.trim() && (
                <div className="space-y-2 pt-2">
                  {searchedTickets.length === 0 ? (
                    <p className="text-xs text-gray-400 font-ethiopic text-center py-2">
                      በዚህ ስም የተገኘ ወረፋ የለም (No queue ticket found for "{searchQuery}")
                    </p>
                  ) : (
                    searchedTickets.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white font-ethiopic">{t.customerName}</p>
                          <p className="text-[11px] text-gray-400 font-ethiopic">
                            {t.barber} • {t.service}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setManagingTicket(t)}
                            className="px-3 py-1.5 rounded-lg bg-[#f5a623] text-black font-bold font-ethiopic text-[11px] hover:brightness-110 cursor-pointer"
                          >
                            ቀይር / ውጣ
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          3. CHOOSE YOUR BARBER WITH LIVE QUEUE (Spaced & Easy to Use)
      ════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 font-ethiopic">
              <span className="p-1.5 rounded-lg bg-[#f5a623]/20 text-[#fbbf24]">
                <Scissors className="w-5 h-5" />
              </span>
              <span>ባርበሮቻችንን ይምረጡ</span>
              <span className="text-gray-400 font-sans text-base font-normal">/ Choose Your Barber</span>
            </h2>
            <p className="text-xs text-gray-400 font-ethiopic mt-1">
              የባርበሩን የቀጥታ ወረፋ፣ የአገልግሎት ዋጋ ዝርዝር ለማየት እና ወረፋ ወይም ቀጠሮ ለመያዝ ባርበሩን ይጫኑ
            </p>
          </div>
          <span className="text-xs font-ethiopic text-[#10b981] bg-[#10b981]/10 px-3.5 py-1.5 rounded-xl border border-[#10b981]/25 self-start sm:self-auto font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            የቀጥታ ወረፋ (Live Queue Active)
          </span>
        </div>

        {/* 4 Barber Cards: EyoB, Brhanu, Serke, Yonas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BARBERS_LIST.map((b) => {
            const barberWaiting = queue.filter(
              (q) => q.barber?.toLowerCase() === b.name.toLowerCase() && q.status === 'waiting'
            );
            const barberServing = queue.find(
              (q) => q.barber?.toLowerCase() === b.name.toLowerCase() && q.status === 'serving'
            );
            const waitTime = barberWaiting.length * AVERAGE_DURATION;

            return (
              <Link
                key={b.id}
                to={`/barber/${b.slug}`}
                className="group glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-[#f5a623]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#f5a623]/15 flex flex-col justify-between bg-gradient-to-b from-[#12121a] to-[#0a0a0f] hover:-translate-y-1.5"
              >
                {/* Barber Photo & Status */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={b.avatar}
                    alt={b.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/30 to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-xs text-[#fbbf24] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#fbbf24]" />
                    <span>{b.rating}</span>
                  </div>

                  {/* Serving vs Available Status Badge */}
                  <div className="absolute top-3 left-3">
                    {barberServing ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#10b981] text-black text-[11px] font-bold font-ethiopic flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        በስራ ላይ (Serving)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#f5a623] text-black text-[11px] font-bold font-ethiopic">
                        ዝግጁ (Available)
                      </span>
                    )}
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-2xl font-black text-white font-ethiopic drop-shadow-md flex items-center justify-between">
                      <span>{b.nameAm}</span>
                      <span className="text-sm font-sans font-normal text-gray-300 opacity-90">({b.name})</span>
                    </h3>
                  </div>
                </div>

                {/* Barber Info & Live Queue Status */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#fbbf24] font-ethiopic">{b.titleAm}</p>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed font-ethiopic">
                      {b.bio}
                    </p>
                  </div>

                  {/* Live Queue Box for this barber */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-ethiopic">የአሁን ሁኔታ:</span>
                      {barberServing ? (
                        <span className="text-[#34d399] font-ethiopic font-bold truncate max-w-[120px]">
                          ወንበር ላይ: {barberServing.customerName}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-ethiopic">ወንበር ክፍት ነው</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-ethiopic">በወረፋ የሚጠብቁ:</span>
                      <span className="font-extrabold text-[#fbbf24] font-ethiopic text-sm">
                        {barberWaiting.length} {barberWaiting.length === 1 ? 'ደንበኛ' : 'ደንበኞች'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                      <span className="text-gray-500 font-ethiopic">የጥበቃ ግምት:</span>
                      <span className="text-[#34d399] font-semibold font-ethiopic">
                        ≈ {waitTime} ደቂቃ
                      </span>
                    </div>
                  </div>

                  {/* Direct Link Button */}
                  <div className="pt-1">
                    <div className="w-full py-3 px-3 rounded-2xl bg-[#f5a623]/15 group-hover:bg-[#f5a623] text-[#fbbf24] group-hover:text-black border border-[#f5a623]/30 font-extrabold text-xs font-ethiopic transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <span>የ{b.nameAm}ን ገፅ ይክፈቱ (Open Profile)</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Manage Queue Ticket Modal ─── */}
      {managingTicket && (
        <QueueManageModal
          ticket={managingTicket}
          onClose={() => setManagingTicket(null)}
          onSuccess={() => {
            setManagingTicket(null);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}
