import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

/**
 * Calculates barber and shop shares from service price and commission rate percentage.
 * @param {number} servicePrice - Price of service in ETB
 * @param {number} commissionRate - Barber commission percentage (0 - 100)
 * @returns {{ barberShare: number, shopShare: number }}
 */
export function calculateCommission(servicePrice, commissionRate) {
  const price = Math.max(0, Number(servicePrice) || 0);
  const rate = Math.min(100, Math.max(0, Number(commissionRate) || 0));

  const barberShare = Math.round(price * (rate / 100) * 100) / 100;
  const shopShare = Math.round((price - barberShare) * 100) / 100;

  return { barberShare, shopShare };
}

/**
 * Internal helper to run aggregation pipeline for barber transactions in a date range.
 * @param {string|mongoose.Types.ObjectId} barberId
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<{ totalRevenue: number, barberTotal: number, shopTotal: number, transactionCount: number }>}
 */
async function aggregateBarberTransactions(barberId, startDate, endDate) {
  const barberObjectId =
    typeof barberId === 'string' ? new mongoose.Types.ObjectId(barberId) : barberId;

  const results = await Transaction.aggregate([
    {
      $match: {
        barber: barberObjectId,
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        barberTotal: { $sum: '$barberCommission' },
        shopTotal: { $sum: '$shopRevenue' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  if (results && results.length > 0) {
    const { totalRevenue, barberTotal, shopTotal, transactionCount } = results[0];
    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      barberTotal: Math.round(barberTotal * 100) / 100,
      shopTotal: Math.round(shopTotal * 100) / 100,
      transactionCount: transactionCount || 0,
    };
  }

  return {
    totalRevenue: 0,
    barberTotal: 0,
    shopTotal: 0,
    transactionCount: 0,
  };
}

/**
 * Aggregates Transaction collection for the given barber on the given day.
 * @param {string|mongoose.Types.ObjectId} barberId
 * @param {Date|string|number} [date=new Date()]
 * @returns {Promise<{ totalRevenue: number, barberTotal: number, shopTotal: number, transactionCount: number }>}
 */
export async function getDailyCommission(barberId, date = new Date()) {
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return aggregateBarberTransactions(barberId, startOfDay, endOfDay);
}

/**
 * Aggregates Transaction collection for the given barber across a 7-day range starting at weekStartDate.
 * @param {string|mongoose.Types.ObjectId} barberId
 * @param {Date|string|number} [weekStartDate=new Date()]
 * @returns {Promise<{ totalRevenue: number, barberTotal: number, shopTotal: number, transactionCount: number }>}
 */
export async function getWeeklyCommission(barberId, weekStartDate = new Date()) {
  const startOfWeek = weekStartDate ? new Date(weekStartDate) : new Date();
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  return aggregateBarberTransactions(barberId, startOfWeek, endOfWeek);
}

/**
 * Aggregates Transaction collection for the given barber for a given month and year.
 * @param {string|mongoose.Types.ObjectId} barberId
 * @param {number} [year] - Year (e.g., 2026)
 * @param {number} [month] - 1-indexed month (1 - 12)
 * @returns {Promise<{ totalRevenue: number, barberTotal: number, shopTotal: number, transactionCount: number }>}
 */
export async function getMonthlyCommission(barberId, year, month) {
  const now = new Date();
  const targetYear = year !== undefined ? Number(year) : now.getFullYear();
  const targetMonth = month !== undefined ? Number(month) : now.getMonth() + 1; // 1-12

  const startOfMonth = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  return aggregateBarberTransactions(barberId, startOfMonth, endOfMonth);
}
