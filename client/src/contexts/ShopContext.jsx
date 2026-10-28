import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SERVICES_LIST } from '../data/servicesData';
import { BARBER_NAMES } from '../data/barbersData';
import api from '../utils/api';
import { io } from 'socket.io-client';

const ShopContext = createContext(null);

// Real Data starts from ZERO (empty queue)
const EMPTY_INITIAL_QUEUE = [];

// Real Data starts from ZERO (0 revenue, 0 services)
const EMPTY_INITIAL_REVENUE = {
  cash: 0,
  telebirr: 0,
  cbe_birr: 0,
  awash_birr: 0,
  totalRevenue: 0,
  totalBarberCommission: 0,
  totalShopRevenue: 0,
  barbers: [
    { name: 'EyoB', services: 0, revenue: 0, commission: 0 },
    { name: 'Brhanu', services: 0, revenue: 0, commission: 0 },
    { name: 'Serke', services: 0, revenue: 0, commission: 0 },
    { name: 'Yonas', services: 0, revenue: 0, commission: 0 },
  ],
};

function getServicePrice(serviceName) {
  if (!serviceName) return 280;
  const match = SERVICES_LIST.find(
    (s) =>
      s.nameAm.toLowerCase().includes(serviceName.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(serviceName.toLowerCase()) ||
      serviceName.toLowerCase().includes(s.nameEn.toLowerCase())
  );
  return match ? match.price : 280;
}

export function ShopProvider({ children }) {
  // Clear any legacy mock storage on initial mount
  useEffect(() => {
    try {
      localStorage.removeItem('ethio_shop_queue');
      localStorage.removeItem('ethio_shop_revenue');
    } catch {}
  }, []);

  // Real Queue state starting from zero
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('ethio_real_queue_v2');
      return saved ? JSON.parse(saved) : EMPTY_INITIAL_QUEUE;
    } catch {
      return EMPTY_INITIAL_QUEUE;
    }
  });

  // Real Revenue & Performance state starting from zero
  const [revenueData, setRevenueData] = useState(() => {
    try {
      const saved = localStorage.getItem('ethio_real_revenue_v2');
      return saved ? JSON.parse(saved) : EMPTY_INITIAL_REVENUE;
    } catch {
      return EMPTY_INITIAL_REVENUE;
    }
  });

  // Save changes to localStorage and broadcast across browser tabs
  useEffect(() => {
    try {
      localStorage.setItem('ethio_real_queue_v2', JSON.stringify(queue));
    } catch (e) {
      console.warn('Queue storage error', e);
    }
  }, [queue]);

  useEffect(() => {
    try {
      localStorage.setItem('ethio_real_revenue_v2', JSON.stringify(revenueData));
    } catch (e) {
      console.warn('Revenue storage error', e);
    }
  }, [revenueData]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ethio_real_queue_v2' && e.newValue) {
        try {
          setQueue(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'ethio_real_revenue_v2' && e.newValue) {
        try {
          setRevenueData(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Socket.IO optional live sync
  useEffect(() => {
    let socket;
    try {
      socket = io('/', { transports: ['websocket', 'polling'], timeout: 3000 });
      socket.on('queue_updated', (updatedQueue) => {
        if (Array.isArray(updatedQueue)) {
          setQueue(updatedQueue);
        }
      });
    } catch {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  /**
   * finishTrim: Called when a barber finishes trimming a customer.
   * 1. Removes finished customer from chair.
   * 2. Moves next waiting customer for this barber to 'serving'.
   * 3. Increments Today's Revenue, Barber Commission (50%), Shop Share (50%), and Barber's service volume.
   */
  const finishTrim = useCallback((customerId, barberName, paymentMethod = 'telebirr') => {
    let finishedCustomer = null;
    let earnedAmount = 280;

    setQueue((prevQueue) => {
      // Find the customer to finish
      finishedCustomer = prevQueue.find((q) => q.id === customerId);
      if (!finishedCustomer) {
        // Fallback: look for the customer currently serving for this barber
        finishedCustomer = prevQueue.find(
          (q) => q.barber?.toLowerCase() === barberName?.toLowerCase() && q.status === 'serving'
        );
      }

      if (finishedCustomer) {
        earnedAmount = finishedCustomer.price || getServicePrice(finishedCustomer.service);
      }

      // Remove the finished customer
      const targetId = finishedCustomer ? finishedCustomer.id : customerId;
      const remaining = prevQueue.filter((q) => q.id !== targetId);

      // Check if there is another customer waiting specifically for this barber
      const nextWaitingForBarber = remaining.find(
        (q) =>
          q.barber?.toLowerCase() === barberName?.toLowerCase() &&
          q.status === 'waiting'
      );

      // Update remaining: promote next waiting to 'serving' and recalculate positions
      const updated = remaining.map((item) => {
        if (nextWaitingForBarber && item.id === nextWaitingForBarber.id) {
          return { ...item, status: 'serving', joinedAt: 'አሁን ጀመረ (Started now)' };
        }
        return item;
      });

      return updated.map((item, index) => ({
        ...item,
        position: index + 1,
      }));
    });

    // Update Revenue & Commission Tracking
    const effectiveBarber = barberName || (finishedCustomer ? finishedCustomer.barber : 'EyoB');
    const amount = Number(earnedAmount) || 280;
    const commission = Math.round(amount * 0.5);
    const shopShare = amount - commission;

    setRevenueData((prev) => {
      const currentMethodTotal = Number(prev[paymentMethod] || 0) + amount;
      const updatedTotalRevenue = Number(prev.totalRevenue || 0) + amount;
      const updatedCommission = Number(prev.totalBarberCommission || 0) + commission;
      const updatedShopRevenue = Number(prev.totalShopRevenue || 0) + shopShare;

      // Update specific barber's service volume & commission
      const updatedBarbers = (prev.barbers || []).map((b) => {
        if (b.name.toLowerCase() === effectiveBarber.toLowerCase()) {
          return {
            ...b,
            services: Number(b.services || 0) + 1,
            revenue: Number(b.revenue || 0) + amount,
            commission: Number(b.commission || 0) + commission,
          };
        }
        return b;
      });

      return {
        ...prev,
        [paymentMethod]: currentMethodTotal,
        totalRevenue: updatedTotalRevenue,
        totalBarberCommission: updatedCommission,
        totalShopRevenue: updatedShopRevenue,
        barbers: updatedBarbers,
      };
    });

    return {
      success: true,
      finishedCustomer,
      amount,
      barber: effectiveBarber,
    };
  }, []);

  /**
   * removeCustomer: Removes a customer without counting as completed revenue
   */
  const removeCustomer = useCallback((customerId) => {
    setQueue((prevQueue) => {
      const remaining = prevQueue.filter((q) => q.id !== customerId);
      return remaining.map((item, index) => ({
        ...item,
        position: index + 1,
      }));
    });
    try {
      const savedId = localStorage.getItem('ethio_my_ticket_id');
      if (savedId && Number(savedId) === customerId) {
        localStorage.removeItem('ethio_my_ticket_id');
      }
    } catch {}
  }, []);

  /**
   * addToQueue: Adds a customer ticket to the queue
   * If the barber's chair is currently open, customer goes directly to 'serving' (In Chair).
   * Otherwise, they enter the waiting line.
   */
  const addToQueue = useCallback(({ customerName, service, barber, price }) => {
    const servicePrice = price || getServicePrice(service);
    const targetBarber = barber || 'EyoB';
    let assignedStatus = 'waiting';
    const newId = Date.now();

    setQueue((prevQueue) => {
      const isChairOccupied = prevQueue.some(
        (q) => q.barber?.toLowerCase() === targetBarber.toLowerCase() && q.status === 'serving'
      );

      assignedStatus = !isChairOccupied ? 'serving' : 'waiting';

      const newEntry = {
        id: newId,
        customerName: customerName.trim(),
        service: service || 'Normal Classic Cut',
        price: servicePrice,
        barber: targetBarber,
        status: assignedStatus,
        joinedAt: assignedStatus === 'serving' ? 'አሁን ጀመረ (Started now)' : 'አሁን ገባ (Just joined)',
      };

      const updated = [...prevQueue, newEntry];
      return updated.map((item, idx) => ({ ...item, position: idx + 1 }));
    });

    try {
      localStorage.setItem('ethio_my_ticket_id', String(newId));
    } catch {}

    return { id: newId, customerName, status: assignedStatus };
  }, []);

  /**
   * callNext: Promotes the first waiting customer for a barber into the chair
   */
  const callNext = useCallback((barberName) => {
    setQueue((prevQueue) => {
      const waiting = prevQueue.find(
        (q) => q.barber?.toLowerCase() === barberName.toLowerCase() && q.status === 'waiting'
      );
      if (!waiting) return prevQueue;

      return prevQueue.map((item) => {
        if (item.id === waiting.id) {
          return { ...item, status: 'serving', joinedAt: 'አሁን ጀመረ (Started now)' };
        }
        return item;
      });
    });
  }, []);

  /**
   * updateQueueEntry: Allows customers to change their barber, service, or name
   */
  const updateQueueEntry = useCallback((customerId, updates) => {
    setQueue((prevQueue) => {
      const existing = prevQueue.find((q) => q.id === customerId);
      if (!existing) return prevQueue;

      const newBarber = updates.barber || existing.barber;
      const newService = updates.service || existing.service;
      const newPrice = updates.price || getServicePrice(newService);
      const newName = updates.customerName !== undefined ? updates.customerName.trim() : existing.customerName;

      // If barber changed, check if new barber's chair is open
      let newStatus = existing.status;
      if (updates.barber && updates.barber.toLowerCase() !== existing.barber.toLowerCase()) {
        const isNewBarberChairOccupied = prevQueue.some(
          (q) => q.id !== customerId && q.barber?.toLowerCase() === newBarber.toLowerCase() && q.status === 'serving'
        );
        newStatus = !isNewBarberChairOccupied ? 'serving' : 'waiting';
      }

      return prevQueue.map((item) => {
        if (item.id === customerId) {
          return {
            ...item,
            customerName: newName,
            barber: newBarber,
            service: newService,
            price: newPrice,
            status: newStatus,
          };
        }
        return item;
      });
    });
  }, []);

  /**
   * resetAllData: Resets queue and revenue to ZERO (clean daily slate)
   */
  const resetAllData = useCallback(() => {
    setQueue(EMPTY_INITIAL_QUEUE);
    setRevenueData(EMPTY_INITIAL_REVENUE);
    try {
      localStorage.setItem('ethio_real_queue_v2', JSON.stringify(EMPTY_INITIAL_QUEUE));
      localStorage.setItem('ethio_real_revenue_v2', JSON.stringify(EMPTY_INITIAL_REVENUE));
    } catch {}
  }, []);

  return (
    <ShopContext.Provider
      value={{
        queue,
        setQueue,
        revenueData,
        setRevenueData,
        finishTrim,
        removeCustomer,
        updateQueueEntry,
        addToQueue,
        callNext,
        resetAllData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
