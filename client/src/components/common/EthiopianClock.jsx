import React, { useState, useEffect } from 'react';
import { toEthiopianTime, formatWesternTime } from '../../utils/ethiopianTime';
import { formatEthiopianDate } from '../../utils/ethiopianCalendar';
import { Clock, Calendar } from 'lucide-react';

export default function EthiopianClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const ethTime = toEthiopianTime(currentTime);
  const westernTimeStr = formatWesternTime(currentTime);
  const ethDateStr = formatEthiopianDate(currentTime);

  const minuteStr = String(ethTime.minute).padStart(2, '0');
  const secondStr = String(ethTime.second || 0).padStart(2, '0');

  return (
    <div className="glass-card px-4 py-2 border border-white/10 flex items-center gap-3 bg-[#12121a]/80 shadow-lg">
      <div className="w-9 h-9 rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] shrink-0">
        <Clock className="w-5 h-5 animate-pulse-glow" />
      </div>

      <div className="flex flex-col">
        {/* Row 1: Ethiopian Time (Large, Gold) */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-lg text-[#fbbf24] tracking-wider font-mono">
            {ethTime.hour}
            <span className="inline-block animate-pulse text-[#f5a623] mx-0.5">:</span>
            {minuteStr}
            <span className="inline-block animate-pulse text-[#f5a623]/70 mx-0.5">:</span>
            <span className="text-xs text-[#fcd34d]/80">{secondStr}</span>
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#f5a623]/20 text-[#fbbf24] font-ethiopic border border-[#f5a623]/30">
            {ethTime.period}
          </span>
        </div>

        {/* Row 2: Western Time & Ethiopian Date */}
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
          <span className="font-mono text-gray-300">ፈረንጅ: {westernTimeStr}</span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1 text-gray-300 font-ethiopic">
            <Calendar className="w-3 h-3 text-[#f5a623]/70 inline" />
            {ethDateStr}
          </span>
        </div>
      </div>
    </div>
  );
}
