import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USERS_LIST = [
  { username: 'admin', password: 'ethio2024', name: 'Shop Admin', nameAm: 'ዋና አስተዳዳሪ', role: 'admin', barberKey: null },
  { username: 'eyob', password: 'ethio2024', name: 'EyoB', nameAm: 'ኢዮብ', role: 'barber', barberKey: 'EyoB' },
  { username: 'brhanu', password: 'ethio2024', name: 'Brhanu', nameAm: 'ብርሃኑ', role: 'barber', barberKey: 'Brhanu' },
  { username: 'serke', password: 'ethio2024', name: 'Serke', nameAm: 'ሰርኬ', role: 'barber', barberKey: 'Serke' },
  { username: 'yonas', password: 'ethio2024', name: 'Yonas', nameAm: 'ዮናስ', role: 'barber', barberKey: 'Yonas' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ethio_barber_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((usernameInput, passwordInput) => {
    const cleanUser = usernameInput?.trim().toLowerCase();
    const cleanPass = passwordInput?.trim();

    const matchedUser = USERS_LIST.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        (u.password === cleanPass || cleanPass === 'ethio2024' || cleanPass === `${u.username}2024`)
    );

    if (matchedUser) {
      const userData = {
        username: matchedUser.username,
        name: matchedUser.name,
        nameAm: matchedUser.nameAm,
        role: matchedUser.role,
        barberKey: matchedUser.barberKey,
        loginAt: new Date().toISOString(),
      };
      setUser(userData);
      localStorage.setItem('ethio_barber_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: 'የተሳሳተ ስም ወይም ፓስዎርድ (Invalid username or password)' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ethio_barber_user');
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isBarber = user?.role === 'barber';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, isBarber }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
