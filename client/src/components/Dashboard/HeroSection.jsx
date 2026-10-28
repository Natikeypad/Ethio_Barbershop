import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, CalendarPlus, Users, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative h-[300px] sm:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden group animate-fadeIn mb-8">
      {/* Background Image */}
      <img
        src="/images/hero-barbershop.jpg"
        alt="Ethiopian Barbershop Interior"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-105"
      />

      {/* Ethiopian Pattern Overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      {/* Dark Gradient Overlays */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/40" />

      {/* Decorative Gold Lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#f5a623]/50 to-transparent z-[3]" />
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#f5a623]/30 to-transparent z-[3]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 lg:p-10">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3" style={{ animationDelay: '100ms' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f5a623]/20 text-[#fbbf24] border border-[#f5a623]/30 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span className="font-ethiopic">ፕሪሚየም አገልግሎት</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            ክፍት / Open Now
          </span>
        </div>

        {/* Title */}
        <div className="animate-slideUp">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-1">
            <span className="font-ethiopic bg-gradient-to-r from-[#f5a623] via-[#fbbf24] to-[#fcd34d] bg-clip-text text-transparent">
              ኢትዮ ባርበር
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/80 font-light tracking-wide mb-1">
            Ethio Barber Management
          </p>
          <p className="text-sm sm:text-base text-white/50 font-ethiopic mb-5">
            ዘመናዊ የፀጉር አገልግሎት • ምርጥ ባርበሮች • ፈጣን አገልግሎት
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3" style={{ animationDelay: '200ms' }}>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#d97706] text-black font-bold text-sm hover:from-[#fbbf24] hover:to-[#f5a623] transition-all shadow-lg shadow-[#f5a623]/20 hover:shadow-[#f5a623]/40 hover:scale-[1.03] active:scale-[0.98]"
          >
            <CalendarPlus className="w-4 h-4" />
            <span className="font-ethiopic">ቀጠሮ ይያዙ</span>
            <span className="text-black/60">|</span>
            <span>Book Now</span>
          </Link>
          <Link
            to="/queue"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all backdrop-blur-sm hover:scale-[1.03] active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-[#34d399]" />
            <span className="font-ethiopic">ወረፋ ይመልከቱ</span>
            <span className="text-white/40">|</span>
            <span>View Queue</span>
          </Link>
        </div>
      </div>

      {/* Floating Scissors Icon */}
      <div className="absolute top-6 right-6 z-10 w-14 h-14 rounded-2xl bg-[#0a0a0f]/60 backdrop-blur-md border border-[#f5a623]/30 flex items-center justify-center">
        <Scissors className="w-7 h-7 text-[#fbbf24] animate-pulse-glow" />
      </div>
    </div>
  );
}
