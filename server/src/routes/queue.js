import express from 'express';
import QueueEntry from '../models/QueueEntry.js';

const router = express.Router();

/**
 * Helper to fetch all active queue entries (waiting or serving) sorted by position
 */
async function fetchActiveQueue() {
  return await QueueEntry.find({
    status: { $in: ['waiting', 'serving'] },
  })
    .populate('service', 'name nameAmharic price durationMinutes category')
    .populate('preferredBarber', 'name phone specialties')
    .sort({ position: 1 });
}

/**
 * Helper to emit real-time Socket.IO queue updates
 */
async function broadcastQueueUpdate(req) {
  const activeQueue = await fetchActiveQueue();
  const io = req.app.get('io');
  if (io) {
    io.emit('queue:updated', activeQueue);
  }
  return activeQueue;
}

/**
 * @route   GET /api/queue/active
 * @desc    Get all waiting and serving queue entries, sorted by position
 */
router.get('/active', async (req, res, next) => {
  try {
    const activeQueue = await fetchActiveQueue();

    return res.json({
      success: true,
      count: activeQueue.length,
      data: activeQueue,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/queue
 * @desc    Add customer to queue (auto-calculates next position)
 */
router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerPhone, serviceId, preferredBarberId } = req.body;

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: 'customerName is required',
      });
    }

    // Auto-calculate position as max current waiting position + 1
    const lastWaiting = await QueueEntry.findOne({ status: 'waiting' }).sort({ position: -1 });
    const nextPosition = lastWaiting && typeof lastWaiting.position === 'number' ? lastWaiting.position + 1 : 1;

    const entry = await QueueEntry.create({
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      service: serviceId || undefined,
      preferredBarber: preferredBarberId || undefined,
      position: nextPosition,
      status: 'waiting',
      joinedAt: new Date(),
    });

    // Populate references before returning and emitting
    await entry.populate([
      { path: 'service', select: 'name nameAmharic price durationMinutes category' },
      { path: 'preferredBarber', select: 'name phone specialties' },
    ]);

    // Broadcast updated queue to all connected Socket.IO clients
    await broadcastQueueUpdate(req);

    return res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/queue/:id/serve
 * @desc    Mark a queue entry as serving and set servedAt
 */
router.patch('/:id/serve', async (req, res, next) => {
  try {
    const entry = await QueueEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    entry.status = 'serving';
    entry.servedAt = new Date();
    await entry.save();

    await entry.populate([
      { path: 'service', select: 'name nameAmharic price durationMinutes category' },
      { path: 'preferredBarber', select: 'name phone specialties' },
    ]);

    await broadcastQueueUpdate(req);

    return res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/queue/:id/complete
 * @desc    Mark a queue entry as completed and set completedAt
 */
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const entry = await QueueEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    entry.status = 'completed';
    entry.completedAt = new Date();
    await entry.save();

    await entry.populate([
      { path: 'service', select: 'name nameAmharic price durationMinutes category' },
      { path: 'preferredBarber', select: 'name phone specialties' },
    ]);

    await broadcastQueueUpdate(req);

    return res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/queue/:id
 * @desc    Remove customer from queue (marks status as 'left')
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const entry = await QueueEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found',
      });
    }

    entry.status = 'left';
    await entry.save();

    await broadcastQueueUpdate(req);

    return res.json({
      success: true,
      message: 'Customer removed from queue',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
