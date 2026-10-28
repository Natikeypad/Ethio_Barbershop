import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { SERVICES_LIST } from '../../data/servicesData';

export default function ServicesGallery() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 font-ethiopic">
            <span className="p-1.5 rounded-lg bg-[#f5a623]/20 text-[#fbbf24]">
              <Scissors className="w-5 h-5" />
            </span>
            <span>የአገልግሎት ዋጋዎች</span>
            <span className="text-gray-400 font-sans text-base font-normal">/ Services & Pricing</span>
          </h2>
          <p className="text-xs text-gray-400 font-ethiopic mt-1">
            ግልጽ እና ተመጣጣኝ የፀጉር፣ የፂም እና የውበት አገልግሎት ዋጋ ዝርዝር
          </p>
        </div>
        <span className="text-xs font-ethiopic text-[#fbbf24] bg-[#f5a623]/10 px-3 py-1.5 rounded-lg border border-[#f5a623]/20 self-start sm:self-auto font-medium">
          በጥራት የሚሰሩ 9 አገልግሎቶች
        </span>
      </div>

      {/* Services Grid with Images and Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES_LIST.map((service, index) => (
          <div
            key={service.id}
            className="group glass-card overflow-hidden rounded-2xl border border-white/10 hover:border-[#f5a623]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#f5a623]/10 hover:-translate-y-1 flex flex-col justify-between bg-gradient-to-b from-[#12121a] to-[#0a0a0f]"
          >
            {/* Image & Badges */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0f]">
              <img
                src={service.image}
                alt={service.styleEn || service.nameEn}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Price Tag */}
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-[#f5a623]/40 text-[#fbbf24] font-black text-base shadow-lg font-mono">
                {service.price} <span className="text-xs font-normal font-ethiopic text-white">ብር</span>
              </div>

              {/* Popular Tag */}
              {service.popular && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#f5a623] text-black font-extrabold text-[11px] font-ethiopic flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>ተመራጭ (Popular)</span>
                </div>
              )}

              {/* Duration Badge */}
              <div className={`absolute ${service.popular ? 'top-12' : 'top-3'} left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-xs text-gray-200 border border-white/10`}>
                <Clock className="w-3.5 h-3.5 text-[#34d399]" />
                <span className="font-ethiopic">{service.durationAm}</span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-ethiopic font-bold text-white text-base leading-snug drop-shadow-md">
                  {service.styleAm}
                </p>
                <p className="text-xs text-gray-200 font-sans mt-0.5 drop-shadow">
                  {service.styleEn}
                </p>
              </div>
            </div>

            {/* Details & Actions */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-ethiopic">
                  {service.nameAm} <span className="font-sans">/ {service.nameEn}</span>
                </p>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                <Link
                  to="/queue"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#f5a623]/15 hover:bg-[#f5a623] text-[#fbbf24] hover:text-black border border-[#f5a623]/30 font-bold text-xs font-ethiopic transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>ወረፋ ይግቡ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/booking"
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-ethiopic transition-all text-center"
                >
                  ቀጠሮ
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
