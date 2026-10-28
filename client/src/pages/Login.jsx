import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scissors, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = login(username.trim(), password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8 animate-fadeIn">
      <div className="glass-card w-full max-w-md p-8 sm:p-10 border border-white/10 rounded-3xl bg-gradient-to-b from-[#12121a] to-[#0a0a0f] shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#f5a623]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f5a623] to-[#fbbf24] p-0.5 mx-auto shadow-lg shadow-[#f5a623]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#12121a] rounded-[14px] flex items-center justify-center">
              <Scissors className="w-6 h-6 text-[#fbbf24]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white font-ethiopic">
            የባርበሮች እና አስተዳዳሪ መግቢያ
          </h1>
          <p className="text-xs text-gray-400">
            Barbers & Admin Dashboard Login
          </p>
        </div>

        {error && (
          <div className="bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#fb7185] px-4 py-2.5 rounded-xl mb-5 text-xs text-center flex items-center justify-center gap-2 font-ethiopic animate-slideUp">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-ethiopic" htmlFor="username">
              የተጠቃሚ ስም (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="eyob, brhanu, serke, yonas, or admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-ethiopic" htmlFor="password">
              የይለፍ ቃል (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0f] border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[#f5a623] outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#d97706] text-black font-extrabold text-sm shadow-xl shadow-[#f5a623]/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 font-ethiopic cursor-pointer mt-2"
          >
            <span>ግባ (Login to Dashboard)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Credentials Helper Card */}
        <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-gray-400 space-y-1 font-ethiopic">
          <p className="text-gray-300 font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#fbbf24]" /> የመግቢያ መረጃ (Quick Access):
          </p>
          <p className="text-[11px] text-gray-400">
            Username: <code className="text-[#fbbf24]">eyob</code>, <code className="text-[#fbbf24]">brhanu</code>, <code className="text-[#fbbf24]">serke</code>, <code className="text-[#fbbf24]">yonas</code>, or <code className="text-[#fbbf24]">admin</code>
          </p>
          <p className="text-[11px] text-gray-400">
            Password: <code className="text-[#34d399]">ethio2024</code>
          </p>
        </div>
      </div>
    </div>
  );
}
