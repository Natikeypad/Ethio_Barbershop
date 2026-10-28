import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import RevenueDashboard from './components/Dashboard/RevenueDashboard';
import QueueBoard from './components/Queue/QueueBoard';
import BookingForm from './components/Booking/BookingForm';
import CustomerPage from './pages/CustomerPage';
import BarberProfilePage from './pages/BarberProfilePage';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col selection:bg-[#f5a623]/30 selection:text-[#fbbf24] relative overflow-hidden">
        {/* Ambient gradients */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-[#f5a623]/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-t from-[#10b981]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Navigation */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/barber/:id" element={<BarberProfilePage />} />
            <Route path="/barbers/:id" element={<BarberProfilePage />} />
            <Route path="/queue" element={<QueueBoard />} />
            <Route path="/booking" element={<BookingForm />} />

            {/* Protected admin-only route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RevenueDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/customer" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-ethiopic text-gray-400">የቀጥታ ስርአት አገልግሎት ላይ</span>
              <span>• Live Barbershop System</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="font-ethiopic">© {new Date().getFullYear()} ኢትዮ ባርበር</span>
              <span>(Ethio Barber POS & Queue)</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
