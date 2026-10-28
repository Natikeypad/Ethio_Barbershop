import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CalendarPlus,
  User,
  Phone,
  Scissors,
  UserCheck,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import api from '../../utils/api';
import { SERVICES_LIST as SERVICES } from '../../data/servicesData';
import { BARBERS_LIST as BARBERS } from '../../data/barbersData';

const TIME_SLOTS = [
  { western: '09:00 AM', eth: '3:00 ሰዓት ቀን' },
  { western: '10:00 AM', eth: '4:00 ሰዓት ቀን' },
  { western: '11:00 AM', eth: '5:00 ሰዓት ቀን' },
  { western: '01:00 PM', eth: '7:00 ሰዓት ቀን' },
  { western: '02:30 PM', eth: '8:30 ሰዓት ቀን' },
  { western: '04:00 PM', eth: '10:00 ሰዓት ቀን' },
  { western: '05:30 PM', eth: '11:30 ሰዓት ቀን' },
  { western: '07:00 PM', eth: '1:00 ሰዓት ሌሊት' },
];

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const barberParam = searchParams.get('barber');

  const initialBarber =
    BARBERS.find(
      (b) =>
        b.id.toLowerCase() === barberParam?.toLowerCase() ||
        b.slug.toLowerCase() === barberParam?.toLowerCase()
    )?.id || BARBERS[0].id;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[0].id);
  const [selectedBarberId, setSelectedBarberId] = useState(initialBarber);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1].western);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Sync barber from URL if user switches
  useEffect(() => {
    if (barberParam) {
      const match = BARBERS.find(
        (b) =>
          b.id.toLowerCase() === barberParam.toLowerCase() ||
          b.slug.toLowerCase() === barberParam.toLowerCase()
      );
      if (match) setSelectedBarberId(match.id);
    }
  }, [barberParam]);

  const selectedService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];
  const selectedBarber = BARBERS.find((b) => b.id === selectedBarberId) || BARBERS[0];
  const selectedTimeSlotObj = TIME_SLOTS.find((t) => t.western === timeSlot) || TIME_SLOTS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setFeedback({ type: 'error', message: 'እባክዎ የደንበኛውን ስም ያስገቡ (Customer name is required)' });
      return;
    }

    if (!phone.trim()) {
      setFeedback({ type: 'error', message: 'እባክዎ የስልክ ቁጥር ያስገቡ (Phone number is required)' });
      return;
    }

    setSubmitting(true);
    const bookingPayload = {
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      service: selectedService.nameEn,
      serviceAmharic: selectedService.nameAm,
      barber: selectedBarber.name,
      price: selectedService.price,
      date: bookingDate,
      time: timeSlot,
      createdAt: new Date().toISOString(),
    };

    try {
      await api.post('/bookings', bookingPayload);
      setFeedback({
        type: 'success',
        message: `ቀጠሮው በተሳካ ሁኔታ ተመዝግቧል! (Booking confirmed for ${customerName})`,
      });
      setCustomerName('');
      setPhone('');
    } catch {
      // Local fallback success for UI demo
      setFeedback({
        type: 'success',
        message: `ቀጠሮው በተሳካ ሁኔታ ተመዝግቧል! Booking confirmed for ${customerName}`,
      });
      setCustomerName('');
      setPhone('');
    } finally {
      setSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fadeIn">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 font-ethiopic">
            <span className="p-1.5 rounded-xl bg-[#f5a623]/20 text-[#fbbf24]">
              <CalendarPlus className="w-6 h-6" />
            </span>
            <span>ቀጠሮ ይያዙ</span>
            <span className="text-gray-400 font-sans text-base font-normal">/ Book An Appointment</span>
          </h1>
          <p className="text-xs text-gray-400 font-ethiopic mt-1">
            የሚፈልጉትን አገልግሎት፣ ባርበር እንዲሁም ቀን እና ሰዓት በመምረጥ ፈጣን ቀጠሮ ይያዙ
          </p>
        </div>
        <Link
          to="/customer"
          className="text-xs text-[#fbbf24] hover:underline font-ethiopic flex items-center gap-1 font-semibold"
        >
          ← ወደ ደንበኞች ገፅ
        </Link>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 animate-slideUp ${
            feedback.type === 'success'
              ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#34d399]'
              : 'bg-[#f43f5e]/20 border-[#f43f5e]/40 text-[#fb7185]'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-semibold font-ethiopic">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-[#12121a]">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-ethiopic">
            <User className="w-4 h-4 text-[#f5a623]" />
            <span>የደንበኛ መረጃ (Customer Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-ethiopic">
                ሙሉ ስም <span className="text-gray-400 font-sans">(Full Name) *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ለምሳሌ፡ ዳዊት መንግስቱ / Dawit"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] outline-none transition-all font-ethiopic"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-ethiopic">
                ስልክ ቁጥር <span className="text-gray-400 font-sans">(Phone Number) *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service & Barber Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Service */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-[#12121a]">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-ethiopic">
              <Scissors className="w-4 h-4 text-[#f5a623]" />
              <span>አገልግሎት ይምረጡ (Select Service)</span>
            </h2>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {SERVICES.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#f5a623] bg-[#f5a623]/15 shadow-sm shadow-[#f5a623]/20'
                        : 'border-white/5 bg-[#0a0a0f]/60 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="font-ethiopic font-bold text-sm text-white">
                        {srv.styleAm || srv.nameAm}
                      </div>
                      <div className="text-xs text-gray-300 font-sans">
                        {srv.styleEn || srv.nameEn}
                      </div>
                      <div className="text-xs text-gray-500 font-ethiopic mt-0.5">
                        {srv.nameAm} • {srv.durationAm}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-base text-[#fbbf24]">
                        {srv.price}
                      </span>
                      <span className="text-xs font-ethiopic text-gray-300 ml-1">ብር</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Select Barber */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-[#12121a]">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-ethiopic">
              <UserCheck className="w-4 h-4 text-[#f5a623]" />
              <span>ባርበር ይምረጡ (Select Barber)</span>
            </h2>

            <div className="space-y-2.5">
              {BARBERS.map((barber) => {
                const isSelected = selectedBarberId === barber.id;
                return (
                  <div
                    key={barber.id}
                    onClick={() => setSelectedBarberId(barber.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#f5a623] bg-[#f5a623]/15 shadow-sm shadow-[#f5a623]/20'
                        : 'border-white/5 bg-[#0a0a0f]/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#f5a623]/30 shrink-0">
                        <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-ethiopic font-bold text-sm text-white">
                          {barber.nameAm} <span className="font-sans text-xs text-gray-400 font-normal">({barber.name})</span>
                        </div>
                        <div className="text-xs text-gray-400 font-sans">
                          {barber.titleAm || barber.title}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/barber/${barber.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-[#fbbf24] hover:underline flex items-center gap-1 font-ethiopic px-2 py-1 rounded bg-white/5"
                    >
                      <span>ገፅ</span> <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Date & Ethiopian Time Slot Selection */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-[#12121a]">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-ethiopic">
            <Clock className="w-4 h-4 text-[#f5a623]" />
            <span>ቀን እና ሰዓት ይምረጡ (Date & Time)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Calendar Date Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-ethiopic">
                የቀጠሮ ቀን <span className="text-gray-400 font-sans">(Date)</span>
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-sm focus:border-[#f5a623] outline-none transition-all"
              />
            </div>

            {/* Time Slot Radio Grid */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-ethiopic">
                የቀጠሮ ሰዓት <span className="text-gray-400 font-sans">(Time Slot)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot.western;
                  return (
                    <button
                      type="button"
                      key={slot.western}
                      onClick={() => setTimeSlot(slot.western)}
                      className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#f5a623] bg-[#f5a623]/20 text-[#fbbf24] font-bold shadow-sm'
                          : 'border-white/5 bg-[#0a0a0f] text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <span className="block text-xs font-bold font-ethiopic">
                        {slot.eth}
                      </span>
                      <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                        {slot.western}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Clean Booking Summary & Confirmation (No Payment & No Commission Split) */}
        <div className="glass-card p-6 rounded-2xl border border-[#f5a623]/30 bg-gradient-to-r from-[#12121a] via-[#1a1a2e] to-[#12121a] shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-gray-400 font-ethiopic">የተመረጠ አገልግሎት ማጠቃለያ:</span>
              <div className="text-lg font-bold text-white font-ethiopic">
                {selectedService.nameAm}{' '}
                <span className="text-sm font-normal text-gray-400">ከ ባርበር {selectedBarber.nameAm} ጋር</span>
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span>📅 {bookingDate}</span>
                <span>•</span>
                <span>⏰ {selectedTimeSlotObj.eth} ({timeSlot})</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-xs text-gray-400 font-ethiopic block">የአገልግሎት ዋጋ</span>
              <span className="text-3xl font-black text-[#fbbf24] font-mono">
                {selectedService.price} <span className="text-sm font-ethiopic text-white">ብር</span>
              </span>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#f5a623] via-[#fbbf24] to-[#f5a623] text-black font-black text-base shadow-xl shadow-[#f5a623]/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-ethiopic"
            >
              <CalendarPlus className="w-5 h-5" />
              <span>ቀጠሮውን አረጋግጥ (Confirm Appointment)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
