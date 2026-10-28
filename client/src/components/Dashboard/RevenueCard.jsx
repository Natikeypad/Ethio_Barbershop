import React from 'react';

const colorMap = {
  emerald: {
    borderLeft: 'border-l-[#10b981]',
    bgCircle: 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30',
    barBg: 'bg-[#10b981]',
    glow: 'hover:shadow-[#10b981]/15',
    textAccent: 'text-[#34d399]',
  },
  blue: {
    borderLeft: 'border-l-[#3b82f6]',
    bgCircle: 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30',
    barBg: 'bg-[#3b82f6]',
    glow: 'hover:shadow-[#3b82f6]/15',
    textAccent: 'text-[#60a5fa]',
  },
  orange: {
    borderLeft: 'border-l-[#f97316]',
    bgCircle: 'bg-[#f97316]/15 text-[#fb923c] border-[#f97316]/30',
    barBg: 'bg-[#f97316]',
    glow: 'hover:shadow-[#f97316]/15',
    textAccent: 'text-[#fb923c]',
  },
  gold: {
    borderLeft: 'border-l-[#f5a623]',
    bgCircle: 'bg-[#f5a623]/15 text-[#fbbf24] border-[#f5a623]/30',
    barBg: 'bg-[#f5a623]',
    glow: 'hover:shadow-[#f5a623]/20',
    textAccent: 'text-[#fbbf24]',
  },
  gray: {
    borderLeft: 'border-l-gray-400',
    bgCircle: 'bg-gray-400/15 text-gray-300 border-gray-400/30',
    barBg: 'bg-gray-400',
    glow: 'hover:shadow-gray-400/15',
    textAccent: 'text-gray-300',
  },
};

export default function RevenueCard({
  title,
  titleAmharic,
  amount = 0,
  icon: Icon,
  color = 'gold',
  percentage = 0,
  animationDelay = 0,
}) {
  const scheme = colorMap[color] || colorMap.gold;
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={`glass-card p-5 border-l-4 ${scheme.borderLeft} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${scheme.glow} animate-slideUp group`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon circle */}
        <div
          className={`w-13 h-13 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shrink-0 ${scheme.bgCircle}`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>

        {/* Right: Titles & Amount */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex flex-col items-end">
            <span className="font-ethiopic font-bold text-base text-gray-100 group-hover:text-white transition-colors">
              {titleAmharic}
            </span>
            <span className="text-xs text-gray-400 font-medium tracking-wide">
              {title}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-end gap-1.5 animate-count-up">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
              {Number(amount).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[#f5a623] font-ethiopic">
              ብር
            </span>
          </div>
        </div>
      </div>

      {/* Percentage Bar */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5 font-medium">
          <span className="font-ethiopic text-[11px]">ከጠቅላላ ገቢ</span>
          <span className="font-mono text-gray-300">{safePercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#1a1a2e] rounded-full h-2 overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${scheme.barBg}`}
            style={{ width: `${safePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
