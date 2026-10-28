import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import { calculateCommission } from '../utils/commissionCalc.js';
import { toEthiopianDate } from '../utils/ethiopianTime.js';

const router = express.Router();

/**
 * @route   GET /api/transactions/revenue/today
 * @desc    Today's revenue breakdown by payment method and grand totals
 * Note: Must be placed BEFORE /:id route
 */
router.get('/revenue/today', async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const groups = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          barberCommission: { $sum: '$barberCommission' },
          shopRevenue: { $sum: '$shopRevenue' },
          count: { $sum: 1 },
        },
      },
    ]);

    const byMethod = {
      cash: { amount: 0, barberCommission: 0, shopRevenue: 0, count: 0 },
      telebirr: { amount: 0, barberCommission: 0, shopRevenue: 0, count: 0 },
      cbe_birr: { amount: 0, barberCommission: 0, shopRevenue: 0, count: 0 },
      awash_birr: { amount: 0, barberCommission: 0, shopRevenue: 0, count: 0 },
    };

    let totalRevenue = 0;
    let totalBarberCommission = 0;
    let totalShopRevenue = 0;
    let totalTransactions = 0;

    for (const group of groups) {
      const method = group._id;
      const amount = Math.round(group.amount * 100) / 100;
      const barberCommission = Math.round(group.barberCommission * 100) / 100;
      const shopRevenue = Math.round(group.shopRevenue * 100) / 100;
      const count = group.count;

      if (byMethod[method] !== undefined) {
        byMethod[method] = {
          amount,
          barberCommission,
          shopRevenue,
          count,
        };
      } else {
        byMethod[method] = {
          amount,
          barberCommission,
          shopRevenue,
          count,
        };
      }

      totalRevenue += amount;
      totalBarberCommission += barberCommission;
      totalShopRevenue += shopRevenue;
      totalTransactions += count;
    }

    const totals = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBarberCommission: Math.round(totalBarberCommission * 100) / 100,
      totalShopRevenue: Math.round(totalShopRevenue * 100) / 100,
      totalTransactions,
    };

    return res.json({
      success: true,
      data: {
        byMethod,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/transactions
 * @desc    List transactions with optional filters (barberId, paymentMethod, date, startDate, endDate)
 */
router.get('/', async (req, res, next) => {
  try {
    const { barberId, paymentMethod, date, startDate, endDate } = req.query;
    const filter = {};

    if (barberId) {
      filter.barber = barberId;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (date) {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.date = { $gte: startOfDay, $lte: endOfDay };
      }
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const s = new Date(startDate);
        if (!isNaN(s.getTime())) {
          s.setHours(0, 0, 0, 0);
          filter.date.$gte = s;
        }
      }
      if (endDate) {
        const e = new Date(endDate);
        if (!isNaN(e.getTime())) {
          e.setHours(23, 59, 59, 999);
          filter.date.$lte = e;
        }
      }
    }

    const transactions = await Transaction.find(filter)
      .populate('barber', 'name phone commissionRate specialties')
      .populate('service', 'name nameAmharic price durationMinutes category')
      .populate('booking')
      .sort({ date: -1 });

    return res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Record a standalone transaction
 */
router.post('/', async (req, res, next) => {
  try {
    const { barberId, serviceId, bookingId, paymentMethod = 'cash', amount, date } = req.body;

    if (!barberId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'barberId and serviceId are required',
      });
    }

    const barber = await Barber.findById(barberId);
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const finalAmount = amount !== undefined ? Number(amount) : service.price;
    const { barberShare, shopShare } = calculateCommission(finalAmount, barber.commissionRate);

    const txDate = date ? new Date(date) : new Date();
    const ethiopianDate = toEthiopianDate(txDate);

    const transaction = await Transaction.create({
      booking: bookingId || undefined,
      barber: barberId,
      service: serviceId,
      amount: finalAmount,
      paymentMethod,
      barberCommission: barberShare,
      shopRevenue: shopShare,
      date: txDate,
      ethiopianDate,
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('barber', 'name phone commissionRate specialties')
      .populate('service', 'name nameAmharic price durationMinutes category')
      .populate('booking');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    return res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
