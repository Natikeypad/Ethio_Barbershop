import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, LayoutDashboard, Users, CalendarPlus, Eye, LogIn, LogOut } from 'lucide-react';
import EthiopianClock from './EthiopianClock';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    {
      path: '/customer',
      labelEn: 'Customer',
      labelAm: 'ደንበኛ',
      icon: Eye,
      isPublic: true,
    },
    {
      path: '/',
      labelEn: 'Dashboard',
      labelAm: 'ዳሽቦርድ',
      icon: LayoutDashboard,
      isPublic: false,
    },
  ];

  // When logged in: Dashboard only! When not logged in: Customer only!
  const visibleNavItems = isAuthenticated
    ? navItems.filter((item) => item.path === '/')
    : navItems.filter((item) => item.path === '/customer');

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <Link
            to={isAuthenticated ? "/" : "/customer"}
            className="flex items-center gap-3.5 group cursor-pointer focus:outline-none"
            id="nav-brand-logo"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#f5a623] to-[#fbbf24] p-0.5 shadow-lg shadow-[#f5a623]/20 group-hover:shadow-[#f5a623]/40 transition-all duration-300">
              <div className="w-full h-full bg-[#12121a] rounded-[14px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-[#fbbf24] transition-transform duration-300 group-hover:rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-ethiopic font-bold text-xl tracking-tight text-white group-hover:text-[#fbbf24] transition-colors">
                ኢትዮ ባርበር
              </span>
              <span className="text-[11px] font-medium tracking-widest uppercase text-gray-400">
                Ethio Barber
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#12121a]/60 p-1.5 rounded-2xl border border-white/5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`nav-link-${item.path === '/' ? 'dashboard' : item.path.slice(1)}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#f5a623]/15 text-[#fbbf24] border border-[#f5a623]/40 shadow-sm shadow-[#f5a623]/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#fbbf24]' : 'text-gray-400'}`} />
                  <span className="font-ethiopic">{item.labelAm}</span>
                  <span className="text-xs opacity-60">/ {item.labelEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Clock + Auth */}
          <div className="flex items-center gap-3">
            <EthiopianClock />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#fbbf24] font-ethiopic font-semibold">
                  <Scissors className="w-3 h-3" />
                  <span>{user?.nameAm || user?.name || 'አስተዳዳሪ'}</span>
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline font-ethiopic">ውጣ</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#f5a623]/15 text-[#fbbf24] border border-[#f5a623]/30 hover:brightness-110 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline font-ethiopic">ግባ</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-white/5 bg-[#12121a]/40 -mx-4 px-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#f5a623]/15 text-[#fbbf24] border border-[#f5a623]/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-ethiopic">{item.labelAm}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
