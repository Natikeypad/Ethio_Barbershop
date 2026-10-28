import express from 'express';
import Barber from '../models/Barber.js';
import {
  getDailyCommission,
  getWeeklyCommission,
  getMonthlyCommission,
} from '../utils/commissionCalc.js';

const router = express.Router();

/**
 * @route   GET /api/barbers
 * @desc    List all active barbers (or all if query `all=true`)
 */
router.get('/', async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    const barbers = await Barber.find(filter).sort({ name: 1 });

    return res.json({
      success: true,
      count: barbers.length,
      data: barbers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/barbers
 * @desc    Create a new barber
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, specialties, commissionRate, isActive, hireDate } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required to register a barber',
      });
    }

    const barber = await Barber.create({
      name: name.trim(),
      phone: phone.trim(),
      specialties: Array.isArray(specialties) ? specialties : [],
      commissionRate: commissionRate !== undefined ? Number(commissionRate) : 50,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
    });

    return res.status(201).json({
      success: true,
      data: barber,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/barbers/:id/commission
 * @desc    Get commission summary for a barber (daily, weekly, monthly)
 * Note: Placed before GET /:id so it routes properly
 */
router.get('/:id/commission', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = 'daily', date, startDate, year, month } = req.query;

    const barber = await Barber.findById(id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }

    let summary;
    const periodLower = period.toLowerCase();

    if (periodLower === 'weekly') {
      const weekStart = startDate || date || new Date();
      summary = await getWeeklyCommission(id, weekStart);
    } else if (periodLower === 'monthly') {
      summary = await getMonthlyCommission(id, year, month);
    } else {
      // default: daily
      summary = await getDailyCommission(id, date || new Date());
    }

    return res.json({
      success: true,
      data: {
        barber: {
          id: barber._id,
          name: barber.name,
          commissionRate: barber.commissionRate,
        },
        period: periodLower,
        summary,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/barbers/:id
 * @desc    Get barber details by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }

    return res.json({
      success: true,
      data: barber,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/barbers/:id
 * @desc    Update barber details
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'phone', 'specialties', 'commissionRate', 'isActive', 'hireDate'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const barber = await Barber.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }

    return res.json({
      success: true,
      data: barber,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
