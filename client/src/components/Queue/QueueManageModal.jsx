import React, { useState } from 'react';
import {
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Scissors,
  User,
  ArrowRight,
} from 'lucide-react';
import { BARBERS_LIST } from '../../data/barbersData';
import { SERVICES_LIST } from '../../data/servicesData';
import { useShop } from '../../contexts/ShopContext';

export default function QueueManageModal({ ticket, onClose, onSuccess }) {
  const { updateQueueEntry, removeCustomer } = useShop();

  const [mode, setMode] = useState('edit'); // 'edit' | 'confirm_delete'
  const [customerName, setCustomerName] = useState(ticket?.customerName || '');
  const [selectedBarber, setSelectedBarber] = useState(ticket?.barber || 'EyoB');
  const [selectedService, setSelectedService] = useState(ticket?.service || SERVICES_LIST[0].nameAm);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!ticket) return null;

  const currentServiceObj = SERVICES_LIST.find(
    (s) => s.nameAm === selectedService || s.nameEn === selectedService
  ) || SERVICES_LIST[0];

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    updateQueueEntry(ticket.id, {
      customerName: customerName.trim(),
      barber: selectedBarber,
      service: selectedService,
      price: currentServiceObj.price,
    });

    setIsSuccess(true);
    setSuccessMessage('የወረፋ መረጃዎ በተሳካ ሁኔታ ተቀይሯል! (Queue updated successfully)');
    setTimeout(() => {
      if (onSuccess) onSuccess('updated');
      onClose();
    }, 1500);
  };

  const handleConfirmDelete = () => {
    removeCustomer(ticket.id);
    setIsSuccess(true);
    setSuccessMessage('ከወረፋው በተሳካ ሁኔታ ወጥተዋል (Successfully left the queue)');
    setTimeout(() => {
      if (onSuccess) onSuccess('deleted');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 border border-[#f5a623]/40 rounded-3xl bg-[#12121a] shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-[#34d399] mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-white font-ethiopic">{successMessage}</h3>
            <p className="text-xs text-gray-400">ይህ መስኮት በቅርቡ ይዘጋል...</p>
          </div>
        ) : mode === 'confirm_delete' ? (
          /* Confirm Delete View */
          <div className="space-y-6 py-2">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white font-ethiopic">
                ከወረፋ መውጣት ይፈልጋሉ?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-ethiopic">
                ውድ <strong className="text-[#fbbf24]">{ticket.customerName}</strong>፣ ከወረፋው ከወጡ የያዙት ተራ ይሰረዛል እና ሌላ ጊዜ እንደ አዲስ መመዝገብ ይኖርብዎታል።
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 space-y-1">
              <p className="flex justify-between">
                <span className="font-ethiopic text-gray-400">ባርበር:</span>
                <span className="font-bold text-white">{ticket.barber}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-ethiopic text-gray-400">አገልግሎት:</span>
                <span className="font-bold text-white">{ticket.service}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="flex-1 py-3 rounded-xl bg-white/10 text-gray-200 hover:text-white font-ethiopic text-xs font-bold transition-all cursor-pointer"
              >
                ተመለስ (Go Back)
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-ethiopic text-xs font-black shadow-lg shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>አዎ፣ ከወረፋ ውጣ (Leave)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Edit Queue Form */
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/15 text-[#fbbf24] border border-[#f5a623]/30 text-xs font-semibold font-ethiopic mb-2">
                <Edit3 className="w-3.5 h-3.5" />
                <span>ወረፋዎን ያስተካክሉ (Manage Your Queue)</span>
              </div>
              <h3 className="text-xl font-black text-white font-ethiopic">
                የወረፋ መረጃ መቀየሪያ
              </h3>
              <p className="text-xs text-gray-400">
                ባርበርዎን ወይም የሚፈልጉትን አገልግሎት በቀላሉ ይቀይሩ።
              </p>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-300 font-ethiopic mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>ሙሉ ስም (Customer Name)</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-xs sm:text-sm focus:border-[#f5a623] outline-none"
              />
            </div>

            {/* Change Barber Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 font-ethiopic mb-1.5 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>ባርበር ይምረጡ (Select Barber)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BARBERS_LIST.map((b) => {
                  const isSelected = selectedBarber.toLowerCase() === b.name.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setSelectedBarber(b.name)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-[#f5a623] bg-[#f5a623]/15 text-[#fbbf24]'
                          : 'border-white/10 bg-[#0a0a0f] text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <img
                        src={b.avatar}
                        alt={b.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-black font-ethiopic truncate">{b.nameAm}</p>
                        <p className="text-[10px] text-gray-400 font-sans">{b.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Change Service Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-300 font-ethiopic mb-1.5">
                የሚፈልጉት አገልግሎት (Select Service)
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 text-white text-xs sm:text-sm focus:border-[#f5a623] outline-none font-ethiopic cursor-pointer"
              >
                {SERVICES_LIST.map((s) => (
                  <option key={s.id} value={s.nameAm} className="bg-[#12121a] text-white">
                    {s.nameAm} — {s.price} ብር ({s.durationAm})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Preview */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-ethiopic">የአገልግሎት ዋጋ:</span>
              <span className="text-lg font-black text-[#fbbf24] font-mono">
                {currentServiceObj.price} <span className="text-xs font-ethiopic text-white">ብር</span>
              </span>
            </div>

            {/* Actions: Save Changes & Leave Queue */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#f5a623] hover:bg-[#d97706] text-black font-black font-ethiopic text-xs sm:text-sm shadow-lg shadow-[#f5a623]/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ለውጦችን አረጋግጥ (Save Changes)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setMode('confirm_delete')}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-ethiopic text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ከወረፋ መውጣት እፈልጋለሁ (Leave Queue)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
