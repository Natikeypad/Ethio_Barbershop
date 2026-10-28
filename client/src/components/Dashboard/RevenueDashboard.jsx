import React, { useState } from 'react';
import {
  Banknote,
  Smartphone,
  Building2,
  Wallet,
  TrendingUp,
  Sparkles,
  DollarSign,
  PieChart,
  Calendar,
  Scissors,
  CheckCircle2,
  UserCheck,
  Users,
  Trash2,
  AlertCircle,
  PlusCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import RevenueCard from './RevenueCard';
import CommissionTable from './CommissionTable';
import HeroSection from './HeroSection';
import { formatEthiopianDate } from '../../utils/ethiopianCalendar';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { BARBERS_LIST } from '../../data/barbersData';
import { SERVICES_LIST } from '../../data/servicesData';

export default function RevenueDashboard() {
  const { queue, revenueData, finishTrim, removeCustomer, callNext, addToQueue, resetAllData } = useShop();
  const { user } = useAuth();

  const [paymentMethodsByBarber, setPaymentMethodsByBarber] = useState({
    EyoB: 'telebirr',
    Brhanu: 'telebirr',
    Serke: 'telebirr',
    Yonas: 'telebirr',
  });

  const [feedback, setFeedback] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerBarber, setNewCustomerBarber] = useState('EyoB');
  const [newCustomerService, setNewCustomerService] = useState(SERVICES_LIST[0].nameAm);

  const total = revenueData.totalRevenue || 1;
  const cashPct = ((revenueData.cash || 0) / total) * 100;
  const telebirrPct = ((revenueData.telebirr || 0) / total) * 100;
  const cbePct = ((revenueData.cbe_birr || 0) / total) * 100;
  const awashPct = ((revenueData.awash_birr || 0) / total) * 100;

  // Handle Finish Trim action
  const handleFinishTrim = (barberName, customer) => {
    if (!customer) return;
    const paymentMethod = paymentMethodsByBarber[barberName] || 'telebirr';
    const result = finishTrim(customer.id, barberName, paymentMethod);

    setFeedback({
      type: 'success',
      message: `✂️ የ ${customer.customerName} አገልግሎት ተጠናቆ ${result.amount} ብር ወደ ዛሬ ገቢ ተመዝግቧል! (${customer.customerName}'s trim finished & recorded)`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Add Walk-in customer from Dashboard
  const handleAddWalkIn = (e) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    addToQueue({
      customerName: newCustomerName.trim(),
      service: newCustomerService,
      barber: newCustomerBarber,
    });

    setFeedback({
      type: 'info',
      message: `ተራ ቁጥር ለ ${newCustomerName} በባርበር ${newCustomerBarber} ወረፋ ተመዝግቧል!`,
    });
    setShowAddModal(false);
    setNewCustomerName('');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <HeroSection />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5a623]/20 text-[#fbbf24] border border-[#f5a623]/30 font-ethiopic flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#f5a623]" />
              የባርበሮችና ገቢ መቆጣጠሪያ
            </span>
            <span className="text-xs text-gray-500">• Daily Performance & Trim Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="font-ethiopic text-gold-gradient">የዛሬ ገቢ እና የስራ ቁጥጥር</span>
            <span className="text-gray-500 font-light text-xl">|</span>
            <span className="text-gray-200 text-xl font-normal tracking-wide">Today's Revenue</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-2 font-ethiopic">
            <Calendar className="w-3.5 h-3.5 text-[#f5a623]" />
            <span>ቀን: {formatEthiopianDate(new Date())}</span>
            <span className="text-gray-600">•</span>
            <span>ባርበር: {user?.nameAm || user?.name || 'አስተዳዳሪ'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              if (window.confirm('ሁሉንም የቀን ዳታ ወደ 0 ዳግም ማስጀመር ይፈልጋሉ? (Are you sure you want to reset all data to 0?)')) {
                resetAllData();
                setFeedback({
                  type: 'info',
                  message: 'ዳታው በተሳካ ሁኔታ ወደ 0 ዳግም ተጀምሯል! (All data reset to 0)',
                });
                setTimeout(() => setFeedback(null), 3000);
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-ethiopic transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset queue and daily revenue to 0"
          >
            <span>🔄 ዳታ 0 አድርግ (Reset 0)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#f5a623] text-black font-extrabold text-xs font-ethiopic hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#f5a623]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ አዲስ ደንበኛ ጨምር (Add Customer)</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 animate-slideUp ${
            feedback.type === 'success'
              ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#34d399]'
              : 'bg-[#3b82f6]/20 border-[#3b82f6]/40 text-[#60a5fa]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold font-ethiopic">{feedback.message}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ACTIVE BARBER STATIONS & TRIM COMPLETION
          (The Barber finishes the trim here -> removes customer from website & updates revenue)
      ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-ethiopic">
              <span className="p-1.5 rounded-lg bg-[#f5a623]/20 text-[#fbbf24]">
                <Scissors className="w-5 h-5" />
              </span>
              <span>የባርበሮች የቀጥታ ስራ መቆጣጠሪያ (Active Trim Stations)</span>
            </h2>
            <p className="text-xs text-gray-400 font-ethiopic mt-0.5">
              ፀጉር ሲጠናቀቅ "አገልግሎት ተጠናቋል" በመጫን ደንበኛውን ከድረ-ገፁ ያስወግዱ እና ገቢውን በቀጥታ ይመዝግቡ
            </p>
          </div>
          <span className="text-xs font-ethiopic text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-lg border border-[#10b981]/20 self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            ከድረ-ገፁ ጋር በቀጥታ የተሳሰረ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BARBERS_LIST.map((barber) => {
            const barberServing = queue.find(
              (q) => q.barber?.toLowerCase() === barber.name.toLowerCase() && q.status === 'serving'
            );
            const barberWaiting = queue.filter(
              (q) => q.barber?.toLowerCase() === barber.name.toLowerCase() && q.status === 'waiting'
            );
            const selectedPayment = paymentMethodsByBarber[barber.name] || 'telebirr';

            return (
              <div
                key={barber.id}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#f5a623]/40 transition-all flex flex-col justify-between space-y-4 bg-[#12121a]"
              >
                {/* Barber Header */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#f5a623]/30 shrink-0">
                    <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-white text-base font-ethiopic truncate">
                      {barber.nameAm} <span className="font-sans text-xs text-gray-400">({barber.name})</span>
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <span>በወረፋ የሚጠብቁ: <strong className="text-[#fbbf24]">{barberWaiting.length}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Chair Status */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 font-ethiopic block">
                    አሁን በወንበር ላይ (In Chair):
                  </span>

                  {barberServing ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-base font-ethiopic">
                          {barberServing.customerName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-[#f5a623]/20 text-[#fbbf24] font-black text-xs font-mono">
                          {barberServing.price || 280} ብር
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{barberServing.service}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#34d399]" /> ጀምሯል: {barberServing.joinedAt}
                      </p>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-gray-400 font-ethiopic">
                      ወንበሩ ክፍት ነው (Chair is empty)
                    </div>
                  )}
                </div>

                {/* Actions when Customer in Chair */}
                {barberServing ? (
                  <div className="space-y-2 pt-1">
                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-[10px] text-gray-400 font-ethiopic mb-1">
                        የክፍያ ዘዴ (Payment):
                      </label>
                      <select
                        value={selectedPayment}
                        onChange={(e) =>
                          setPaymentMethodsByBarber((prev) => ({
                            ...prev,
                            [barber.name]: e.target.value,
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a0f] border border-white/10 text-xs text-white font-ethiopic outline-none focus:border-[#f5a623]"
                      >
                        <option value="telebirr">ቴሌ ብር (Telebirr)</option>
                        <option value="cbe_birr">ሲቢኢ ብር (CBE Birr)</option>
                        <option value="cash">ጥሬ ገንዘብ (Cash)</option>
                        <option value="awash_birr">አዋሽ ብር (Awash Birr)</option>
                      </select>
                    </div>

                    {/* Finish Trim Button */}
                    <button
                      onClick={() => handleFinishTrim(barber.name, barberServing)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-extrabold text-xs font-ethiopic shadow-lg shadow-[#10b981]/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>ፀጉር ተጠናቋል (Finish Trim)</span>
                    </button>

                    {/* Cancel/Remove from chair */}
                    <button
                      onClick={() => removeCustomer(barberServing.id)}
                      className="w-full py-1 text-[11px] text-gray-400 hover:text-[#fb7185] font-ethiopic transition-colors"
                    >
                      ከወንበር አስወግድ (Remove)
                    </button>
                  </div>
                ) : (
                  <div>
                    {barberWaiting.length > 0 ? (
                      <button
                        onClick={() => callNext(barber.name)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#f5a623] text-black font-extrabold text-xs font-ethiopic hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>ቀጣይ ደንበኛ ጥሩ (Call #{barberWaiting[0]?.position})</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setNewCustomerBarber(barber.name);
                          setShowAddModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-ethiopic border border-white/5 transition-all"
                      >
                        + ደንበኛ መዝግብ
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TODAY'S REVENUE CARDS (Dynamic & Linked to completed trims)
      ════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span className="font-ethiopic">የገቢ ክፍፍል እና ዝርዝር</span>
          <span className="text-gray-400 text-xs font-normal">/ Payment Channel Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <RevenueCard
            type="cash"
            amount={revenueData.cash}
            labelEn="Cash"
            labelAm="ጥሬ ገንዘብ"
            icon={Banknote}
            percent={cashPct}
            color="amber"
          />
          <RevenueCard
            type="telebirr"
            amount={revenueData.telebirr}
            labelEn="Telebirr"
            labelAm="ቴሌ ብር"
            icon={Smartphone}
            percent={telebirrPct}
            color="emerald"
          />
          <RevenueCard
            type="cbe_birr"
            amount={revenueData.cbe_birr}
            labelEn="CBE Birr"
            labelAm="ሲቢኢ ብር"
            icon={Building2}
            percent={cbePct}
            color="blue"
          />
          <RevenueCard
            type="awash_birr"
            amount={revenueData.awash_birr}
            labelEn="Awash Birr"
            labelAm="አዋሽ ብር"
            icon={Wallet}
            percent={awashPct}
            color="orange"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TOTAL REVENUE & 50/50 COMMISSION SPLIT BANNER
      ════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6 border border-white/10 relative overflow-hidden bg-gradient-to-r from-[#12121a] via-[#1a1a2e] to-[#12121a]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-xs font-semibold text-[#fbbf24] uppercase tracking-wider">
                Total Daily Revenue
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono flex items-baseline gap-2">
              <span>{Number(revenueData.totalRevenue).toLocaleString()}</span>
              <span className="text-sm font-normal text-gray-400 font-ethiopic">ብር (ETB)</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-ethiopic">
              የዛሬው ጠቅላላ ገቢ በ50% ባርበር እና 50% ሱቅ እኩል ክፍፍል
            </p>
          </div>

          {/* 50/50 Commission Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-auto w-full">
            <div className="bg-[#12121a]/90 p-4 rounded-xl border border-white/10 flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#34d399] shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-ethiopic">የባርበሮች ኮሚሽን (50%)</span>
                <span className="text-lg font-bold text-[#34d399] font-mono">
                  {Number(revenueData.totalBarberCommission).toLocaleString()}
                  <span className="text-xs font-normal text-gray-400 ml-1 font-ethiopic">ብር</span>
                </span>
              </div>
            </div>

            <div className="bg-[#12121a]/90 p-4 rounded-xl border border-white/10 flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center text-[#60a5fa] shrink-0">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-ethiopic">የሱቅ ድርሻ (50%)</span>
                <span className="text-lg font-bold text-[#60a5fa] font-mono">
                  {Number(revenueData.totalShopRevenue).toLocaleString()}
                  <span className="text-xs font-normal text-gray-400 ml-1 font-ethiopic">ብር</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DAILY PERFORMANCE & SERVICE VOLUME TRACKING
          (Increments in real-time as trims are completed)
      ════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f5a623]" />
            <span className="font-ethiopic">የባርበሮች የስራ ዝርዝር እና አገልግሎት ብዛት</span>
            <span className="text-gray-400 text-xs font-normal">/ Daily Service Volume Tracking</span>
          </h2>
        </div>
        <CommissionTable barbers={revenueData.barbers} />
      </div>

      {/* ─── Modal to Add Walk-In Customer ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 border border-[#f5a623]/40 rounded-3xl bg-[#12121a] shadow-2xl relative">
            <h3 className="text-xl font-bold text-white font-ethiopic mb-1">
              አዲስ ደንበኛ ወደ ወረፋ አስገባ
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Register a walk-in customer into any barber station.
            </p>

            <form onSubmit={handleAddWalkIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 font-ethiopic mb-1.5">
                  የደንበኛ ስም (Customer Name) *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="ለምሳሌ፡ ዮናታን / Yonatan"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 font-ethiopic mb-1.5">
                  ባርበር ይምረጡ (Barber)
                </label>
                <select
                  value={newCustomerBarber}
                  onChange={(e) => setNewCustomerBarber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:border-[#f5a623] outline-none font-ethiopic"
                >
                  {BARBERS_LIST.map((b) => (
                    <option key={b.id} value={b.name} className="bg-[#12121a] text-white">
                      {b.nameAm} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 font-ethiopic mb-1.5">
                  አገልግሎት (Service)
                </label>
                <select
                  value={newCustomerService}
                  onChange={(e) => setNewCustomerService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:border-[#f5a623] outline-none font-ethiopic"
                >
                  {SERVICES_LIST.map((s) => (
                    <option key={s.id} value={s.nameAm} className="bg-[#12121a] text-white">
                      {s.nameAm} — {s.price} ብር
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 hover:text-white font-ethiopic text-sm transition-all"
                >
                  ሰርዝ (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#f5a623] text-black font-extrabold font-ethiopic text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#f5a623]/25"
                >
                  ወረፋ አስገባ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
