import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Award, TrendingUp, Scissors, ExternalLink } from 'lucide-react';
import { getBarberById } from '../../data/barbersData';

export default function CommissionTable({ barbers = [] }) {
  const totalServices = barbers.reduce((acc, b) => acc + (Number(b.services) || 0), 0);
  const totalRevenue = barbers.reduce((acc, b) => acc + (Number(b.revenue) || 0), 0);
  const totalCommission = barbers.reduce((acc, b) => acc + (Number(b.commission) || 0), 0);

  return (
    <div className="glass-card overflow-hidden border border-white/10 shadow-2xl">
      {/* Table Header Section */}
      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#12121a]/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-ethiopic font-bold text-lg text-white flex items-center gap-2">
              የባርበሮች ኮሚሽን ክፍፍል
              <span className="text-xs font-normal text-gray-400 font-sans">
                (Barbers Commission Distribution)
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Daily revenue split & service volume tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          <UserCheck className="w-4 h-4 text-[#10b981]" />
          <span>Active Barbers: <strong className="text-white">{barbers.length}</strong></span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#1a1a2e]/60 text-xs font-semibold uppercase tracking-wider text-[#fbbf24]">
              <th className="py-3.5 px-6">
                <span className="font-ethiopic font-bold text-sm block normal-case">ባርበር</span>
                <span className="text-[10px] text-gray-400">Barber Name</span>
              </th>
              <th className="py-3.5 px-6 text-center">
                <span className="font-ethiopic font-bold text-sm block normal-case">አገልግሎቶች</span>
                <span className="text-[10px] text-gray-400">Services Done</span>
              </th>
              <th className="py-3.5 px-6 text-right">
                <span className="font-ethiopic font-bold text-sm block normal-case">ጠቅላላ ገቢ</span>
                <span className="text-[10px] text-gray-400">Total Revenue (ETB)</span>
              </th>
              <th className="py-3.5 px-6 text-right">
                <span className="font-ethiopic font-bold text-sm block normal-case">የባርበር ኮሚሽን</span>
                <span className="text-[10px] text-gray-400">Commission (50%)</span>
              </th>
              <th className="py-3.5 px-6 text-right">
                <span className="font-ethiopic font-bold text-sm block normal-case">የሱቅ ድርሻ</span>
                <span className="text-[10px] text-gray-400">Shop Share</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {barbers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-ethiopic">
                  ምንም የተመዘገበ መረጃ የለም (No barber records found)
                </td>
              </tr>
            ) : (
              barbers.map((barber, index) => {
                const shopShare = (Number(barber.revenue) || 0) - (Number(barber.commission) || 0);
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={barber.name || index}
                    className={`transition-colors duration-150 hover:bg-[#f5a623]/5 group ${
                      isEven ? 'bg-[#12121a]/40' : 'bg-[#1a1a2e]/20'
                    }`}
                  >
                    {/* Barber Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f5a623]/20 to-[#fbbf24]/10 border border-[#f5a623]/30 flex items-center justify-center font-bold text-xs text-[#fbbf24]">
                          {barber.name ? barber.name.charAt(0).toUpperCase() : 'B'}
                        </div>
                        <div>
                          {getBarberById(barber.name) ? (
                            <Link
                              to={`/barber/${getBarberById(barber.name).slug}`}
                              className="font-medium text-white hover:text-[#fbbf24] transition-colors flex items-center gap-1 group/link"
                            >
                              <span>{getBarberById(barber.name).nameAm} ({barber.name})</span>
                              <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-[#fbbf24]" />
                            </Link>
                          ) : (
                            <span className="font-medium text-white group-hover:text-[#fbbf24] transition-colors">
                              {barber.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Services Done */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
                        <Scissors className="w-3 h-3 text-[#f5a623]" />
                        {barber.services}
                      </span>
                    </td>

                    {/* Total Revenue */}
                    <td className="py-4 px-6 text-right font-mono font-medium text-gray-200">
                      <span>{Number(barber.revenue).toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1 font-ethiopic">ብር</span>
                    </td>

                    {/* Commission */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-[#10b981]">
                      <span>{Number(barber.commission).toLocaleString()}</span>
                      <span className="text-xs text-[#10b981]/70 ml-1 font-ethiopic">ብር</span>
                    </td>

                    {/* Shop Share */}
                    <td className="py-4 px-6 text-right font-mono font-medium text-[#60a5fa]">
                      <span>{Number(shopShare).toLocaleString()}</span>
                      <span className="text-xs text-[#60a5fa]/70 ml-1 font-ethiopic">ብር</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Totals Row */}
          {barbers.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-[#f5a623]/30 bg-[#12121a] font-semibold text-white">
                <td className="py-4 px-6 font-ethiopic font-bold text-base text-[#fbbf24]">
                  ድምር (Grand Total)
                </td>
                <td className="py-4 px-6 text-center font-mono font-bold text-[#fbbf24]">
                  {totalServices}
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-white text-base">
                  {totalRevenue.toLocaleString()}{' '}
                  <span className="text-xs font-ethiopic text-[#f5a623]">ብር</span>
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-[#10b981] text-base">
                  {totalCommission.toLocaleString()}{' '}
                  <span className="text-xs font-ethiopic">ብር</span>
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-[#60a5fa] text-base">
                  {(totalRevenue - totalCommission).toLocaleString()}{' '}
                  <span className="text-xs font-ethiopic">ብር</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
