import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Scissors,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  CalendarPlus,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { BARBERS_LIST, getBarberById } from '../data/barbersData';
import { SERVICES_LIST } from '../data/servicesData';
import { useShop } from '../contexts/ShopContext';

const AVERAGE_DURATION = 30; // minutes per service

export default function BarberProfilePage() {
  const { id } = useParams();
  const barber = getBarberById(id);
  const { queue, addToQueue } = useShop();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [selectedService, setSelectedService] = useState(SERVICES_LIST[0].nameAm);
  const [joinSuccess, setJoinSuccess] = useState(false);

  if (!barber) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-[#f5a623] mx-auto" />
        <h2 className="text-2xl font-bold font-ethiopic text-white">ባርበሩ አልተገኘም (Barber Not Found)</h2>
        <p className="text-gray-400 text-sm">የመረጡት ባርበር በስርአቱ ውስጥ አልተገኘም።</p>
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f5a623] text-black font-bold font-ethiopic"
        >
          <ArrowLeft className="w-4 h-4" /> ወደ ደንበኞች ገፅ ይመለሱ
        </Link>
      </div>
    );
  }

  // Filter queue specifically for this barber
  const barberServing = queue.find(
    (q) => q.barber?.toLowerCase() === barber.name.toLowerCase() && q.status === 'serving'
  );
  const barberWaiting = queue.filter(
    (q) => q.barber?.toLowerCase() === barber.name.toLowerCase() && q.status === 'waiting'
  );
  const estimatedWaitMinutes = barberWaiting.length * AVERAGE_DURATION;

  // Handle quick join queue specifically for this barber
  const handleQuickJoinQueue = (e) => {
    e.preventDefault();
    if (!customerNameInput.trim()) return;

    addToQueue({
      customerName: customerNameInput.trim(),
      service: selectedService,
      barber: barber.name,
    });

    setJoinSuccess(true);
    setTimeout(() => {
      setJoinSuccess(false);
      setShowJoinModal(false);
      setCustomerNameInput('');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4 animate-fadeIn">
      {/* ─── Top Bar: Back & Barber Switcher ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-[#f5a623]/40 transition-all text-xs sm:text-sm font-ethiopic"
        >
          <ArrowLeft className="w-4 h-4 text-[#fbbf24]" />
          <span>← ወደ ደንበኞች ገፅ (Customer Home)</span>
        </Link>

        {/* Quick Barber Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs text-gray-500 font-ethiopic mr-1">ባርበር ይቀይሩ:</span>
          {BARBERS_LIST.map((b) => {
            const isCurrent = b.id === barber.id;
            return (
              <Link
                key={b.id}
                to={`/barber/${b.slug}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-ethiopic font-semibold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#f5a623] text-black shadow-md shadow-[#f5a623]/25 font-bold'
                    : 'bg-[#12121a] text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{b.nameAm}</span>
                <span className="font-sans text-[11px] opacity-80">({b.name})</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. BARBER IMAGE & NAME HEADER (Simple, Clean, No Personal Bio)
      ════════════════════════════════════════════════════════════ */}
      <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#12121a] via-[#0a0a0f] to-[#12121a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#f5a623]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Barber Image */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-[#f5a623]/40 shadow-2xl relative">
              <img
                src={barber.avatar}
                alt={barber.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-xs font-ethiopic bg-[#f5a623] text-black font-extrabold px-3 py-0.5 rounded-lg">
                  {barber.nameAm}
                </span>
              </div>
            </div>

            {/* Serving vs Ready Status Dot */}
            <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-[#10b981] text-black font-bold text-xs flex items-center gap-1.5 shadow-lg border border-black/40">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{barberServing ? 'በስራ ላይ' : 'ዝግጁ'}</span>
            </div>
          </div>

          {/* Name & Quick Action Header */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/15 text-[#fbbf24] border border-[#f5a623]/30 text-xs font-semibold font-ethiopic">
              <Scissors className="w-3.5 h-3.5" />
              <span>ባርበር {barber.nameAm}</span>
              <span className="text-gray-400 font-sans font-normal">• Barber Station</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="font-ethiopic">{barber.nameAm}</span>
              <span className="text-gray-400 font-sans font-light text-2xl sm:text-3xl">/ {barber.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 font-ethiopic max-w-xl">
              ከታች የቀጥታ ወረፋውን ይመልከቱ፣ ወረፋ ይግቡ ወይም የሚፈልጉትን አገልግሎት መርጠው በቀጥታ ይስተናገዱ።
            </p>

            {/* Direct Actions: Join Queue & Book Appointment */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#d97706] text-black font-black text-xs sm:text-sm shadow-xl shadow-[#f5a623]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 font-ethiopic cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>በ{barber.nameAm} ወረፋ ይግቡ (Join Queue)</span>
              </button>

              <Link
                to={`/booking?barber=${barber.id}`}
                className="px-6 py-2.5 rounded-xl bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#34d399] border border-[#10b981]/40 font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-2 font-ethiopic"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>ቀጠሮ ይያዙ (Book Appointment)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. LIVE QUEUE FOR THAT BARBER (Simple & Easy)
      ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-ethiopic">
            <span className="p-1.5 rounded-lg bg-[#f5a623]/20 text-[#fbbf24]">
              <Users className="w-4 h-4" />
            </span>
            <span>የ{barber.nameAm} የቀጥታ ወረፋ</span>
            <span className="text-gray-400 font-sans text-sm font-normal">/ Live Queue</span>
          </h2>
          <span className="text-xs text-[#34d399] font-ethiopic bg-[#10b981]/10 px-3 py-1 rounded-lg border border-[#10b981]/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
            ቀጥታ ስርጭት
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Currently In Chair */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#12121a] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-[#34d399] font-ethiopic flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
                አሁን በወንበር ላይ (In Chair)
              </span>

              {barberServing ? (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-2xl font-black text-white font-ethiopic">
                    {barberServing.customerName}
                  </h3>
                  <p className="text-xs text-[#fbbf24] font-medium flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5" /> {barberServing.service}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3 text-[#34d399]" />
                    <span>የተጀመረው: {barberServing.joinedAt}</span>
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-[#34d399] mx-auto" />
                  <p className="text-sm font-bold text-white font-ethiopic">ወንበሩ ክፍት ነው!</p>
                  <p className="text-xs text-gray-400">አሁን ወረፋ በመግባት ወዲያውኑ ይስተናገዱ።</p>
                </div>
              )}
            </div>

            {/* In Queue metrics */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-center">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xl font-black text-[#fbbf24]">{barberWaiting.length}</p>
                <p className="text-[11px] text-gray-300 font-ethiopic">በወረፋ የሚጠብቁ</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xl font-black text-[#34d399]">≈ {estimatedWaitMinutes}</p>
                <p className="text-[11px] text-gray-300 font-ethiopic">ደቂቃዎች ጥበቃ</p>
              </div>
            </div>
          </div>

          {/* Waiting Queue List for this Barber */}
          <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/10 bg-[#12121a] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-ethiopic flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#f5a623]" />
                በወረፋ ላይ ያሉ ደንበኞች ({barberWaiting.length})
              </h3>
              <button
                onClick={() => setShowJoinModal(true)}
                className="text-xs text-[#fbbf24] hover:underline font-ethiopic font-semibold cursor-pointer"
              >
                + ወረፋ ይግቡ
              </button>
            </div>

            {barberWaiting.length === 0 ? (
              <div className="p-6 text-center border border-white/5 rounded-xl bg-white/5 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#34d399] mx-auto" />
                <p className="text-sm font-bold text-white font-ethiopic">
                  በአሁኑ ሰዓት በ{barber.nameAm} ወረፋ ላይ የሚጠብቅ ደንበኛ የለም!
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#f5a623] text-black font-bold text-xs font-ethiopic hover:brightness-110 cursor-pointer"
                >
                  የመጀመሪያው ተራ ይሁኑ →
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {barberWaiting.map((cust, idx) => {
                  const wait = (idx + 1) * AVERAGE_DURATION;
                  return (
                    <div
                      key={cust.id}
                      className="p-3 rounded-xl bg-[#0a0a0f]/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-[#fbbf24]">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-white font-ethiopic">{cust.customerName}</h4>
                          <p className="text-[11px] text-gray-400">{cust.service}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <span className="text-[11px] text-[#fcd34d] font-ethiopic">
                          {idx === 0 ? 'ቀጣዩ ተራ' : `${idx} ሰዎች ይቀሩዎታል`}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#34d399] font-bold text-[11px] font-ethiopic">
                          ≈ {wait} ደቂቃ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. SERVICE COST (Clear Cards with Images & Prices)
      ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-ethiopic">
              <span className="p-1.5 rounded-lg bg-[#f5a623]/20 text-[#fbbf24]">
                <Scissors className="w-4 h-4" />
              </span>
              <span>የአገልግሎት ዋጋዎች (Service Cost)</span>
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-ethiopic">
            የሚፈልጉትን አገልግሎት መርጠው ወረፋ ይግቡ
          </span>
        </div>

        {/* 9 Service Cards with Image and Exact Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES_LIST.map((srv) => (
            <div
              key={srv.id}
              className="group glass-card overflow-hidden rounded-2xl border border-white/10 hover:border-[#f5a623]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#f5a623]/10 flex flex-col justify-between bg-gradient-to-b from-[#12121a] to-[#0a0a0f]"
            >
              {/* Service Image & Price Tag */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0f]">
                <img
                  src={srv.image}
                  alt={srv.styleEn || srv.nameEn}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Price Tag */}
                <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-[#f5a623]/40 text-[#fbbf24] font-black text-sm font-mono shadow-md">
                  {srv.price} <span className="text-[10px] font-ethiopic text-white">ብር</span>
                </div>

                {/* Duration */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[11px] text-gray-200 border border-white/10">
                  <Clock className="w-3 h-3 text-[#34d399]" />
                  <span className="font-ethiopic">{srv.durationAm}</span>
                </div>

                {/* Style name on the photo */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-ethiopic font-bold text-white text-sm leading-snug drop-shadow-md">
                    {srv.styleAm}
                  </p>
                  <p className="text-[11px] text-gray-200 font-sans mt-0.5 drop-shadow">
                    {srv.styleEn}
                  </p>
                </div>
              </div>

              {/* Service Info & Action Button */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-[11px] text-gray-400 font-ethiopic">
                  {srv.nameAm} <span className="font-sans">/ {srv.nameEn}</span>
                </p>

                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSelectedService(srv.nameAm);
                      setShowJoinModal(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#f5a623]/15 hover:bg-[#f5a623] text-[#fbbf24] hover:text-black border border-[#f5a623]/30 font-bold text-xs font-ethiopic transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>ይህንን ይምረጡ (ወረፋ ይግቡ)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Direct Action Modal (Quick Queue Registration) ─── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 border border-[#f5a623]/40 rounded-3xl bg-[#12121a] shadow-2xl relative">
            <h3 className="text-xl font-bold text-white font-ethiopic mb-1">
              በ{barber.nameAm} ({barber.name}) ወረፋ ይግቡ
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              ስምዎን እና የሚፈልጉትን አገልግሎት በመምረጥ ፈጣን የወረፋ ቲኬት ይውሰዱ።
            </p>

            {joinSuccess ? (
              <div className="p-6 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/40 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#34d399] mx-auto animate-bounce" />
                <p className="text-lg font-bold text-white font-ethiopic">
                  በተሳካ ሁኔታ በ{barber.nameAm} ወረፋ ተመዝግበዋል!
                </p>
                <p className="text-xs text-gray-300">
                  ተራ ቁጥርዎ #{queue.length} ነው። በቅርቡ ይጠራሉ!
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickJoinQueue} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 font-ethiopic mb-1.5">
                    ሙሉ ስምዎን ያስገቡ (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    placeholder="ለምሳሌ፡ ዳዊት / Dawit"
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 font-ethiopic mb-1.5">
                    የሚፈልጉት አገልግሎት (Service)
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:border-[#f5a623] outline-none font-ethiopic"
                  >
                    {SERVICES_LIST.map((s) => (
                      <option key={s.id} value={s.nameAm} className="bg-[#12121a] text-white">
                        {s.styleAm} / {s.styleEn} — {s.price} ብር
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-ethiopic">የተመረጠ ባርበር:</span>
                    <strong className="text-[#fbbf24] font-ethiopic">{barber.nameAm} ({barber.name})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-ethiopic">የጥበቃ ጊዜ ግምት:</span>
                    <strong className="text-[#34d399] font-ethiopic">≈ {estimatedWaitMinutes} ደቂቃዎች</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-gray-300 hover:text-white font-ethiopic text-sm transition-all cursor-pointer"
                  >
                    ሰርዝ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#f5a623] text-black font-black font-ethiopic text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#f5a623]/25 cursor-pointer"
                  >
                    ወረፋ ያረጋግጡ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
