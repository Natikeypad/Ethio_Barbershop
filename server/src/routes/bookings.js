import express from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Barber from '../models/Barber.js';
import Transaction from '../models/Transaction.js';
import { calculateCommission } from '../utils/commissionCalc.js';
import { toEthiopianDate } from '../utils/ethiopianTime.js';

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking with overlap check, commission calculation, and initial transaction
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      barberId,
      serviceId,
      startTime,
      paymentMethod = 'cash',
      source = 'walk-in',
      notes,
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !barberId || !serviceId || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'customerName, customerPhone, barberId, serviceId, and startTime are required',
      });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startTime provided',
      });
    }

    // 2. Find the Service by serviceId, get durationMinutes and price
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // 3. Calculate endTime = startTime + durationMinutes * 60000
    const end = new Date(start.getTime() + service.durationMinutes * 60000);

    // 4. Check for overlapping bookings for this barber
    const conflicts = await Booking.find({
      barber: barberId,
      status: { $nin: ['cancelled', 'completed'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    // 5. If overlap found, return 409 conflict
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Time slot conflicts with existing booking',
        conflicts,
      });
    }

    // 6. Find the Barber by barberId, get commissionRate
    const barber = await Barber.findById(barberId);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }

    // 7. Calculate commission using commissionCalc.calculateCommission(price, commissionRate)
    const { barberShare, shopShare } = calculateCommission(service.price, barber.commissionRate);

    // 8. Convert startTime to Ethiopian date using ethiopianTime.toEthiopianDate
    const ethiopianDate = toEthiopianDate(start);

    // 9. Create Booking document
    const booking = await Booking.create({
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
      },
      barber: barberId,
      service: serviceId,
      startTime: start,
      endTime: end,
      status: 'pending',
      source,
      ethiopianDate,
      notes: notes ? notes.trim() : undefined,
    });

    // 10. Create Transaction document with the commission split
    const transaction = await Transaction.create({
      booking: booking._id,
      barber: barberId,
      service: serviceId,
      amount: service.price,
      paymentMethod,
      barberCommission: barberShare,
      shopRevenue: shopShare,
      date: start,
      ethiopianDate,
    });

    // 11. Return 201 response with created records
    return res.status(201).json({
      success: true,
      data: {
        booking,
        transaction,
        commission: {
          rate: barber.commissionRate,
          barberShare,
          shopShare,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bookings
 * @desc    List bookings with optional filters (date, barberId, status)
 */
router.get('/', async (req, res, next) => {
  try {
    const { date, barberId, status } = req.query;
    const filter = {};

    if (barberId) {
      filter.barber = barberId;
    }

    if (status) {
      filter.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.startTime = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const bookings = await Booking.find(filter)
      .populate('barber', 'name phone commissionRate specialties isActive')
      .populate('service', 'name nameAmharic price durationMinutes category')
      .sort({ startTime: 1 });

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('barber', 'name phone commissionRate specialties isActive')
      .populate('service', 'name nameAmharic price durationMinutes category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('barber', 'name phone commissionRate specialties isActive')
      .populate('service', 'name nameAmharic price durationMinutes category');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    return res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
