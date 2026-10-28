import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

/**
 * @route   GET /api/services
 * @desc    List all active services (or all if query `all=true`), filter by category
 */
router.get('/', async (req, res, next) => {
  try {
    const { all, category } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    if (category) {
      filter.category = category;
    }

    const services = await Service.find(filter).sort({ category: 1, price: 1 });

    return res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/services
 * @desc    Create a new service
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, nameAmharic, price, durationMinutes, category, isActive } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required',
      });
    }

    const service = await Service.create({
      name: name.trim(),
      nameAmharic: nameAmharic ? nameAmharic.trim() : undefined,
      price: Number(price),
      durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : 30,
      category,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/services/:id
 * @desc    Get service details by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/services/:id
 * @desc    Update service details
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'nameAmharic', 'price', 'durationMinutes', 'category', 'isActive'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const service = await Service.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    return res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
