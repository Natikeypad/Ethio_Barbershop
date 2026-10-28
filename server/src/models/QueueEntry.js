import mongoose from 'mongoose';

const queueEntrySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    preferredBarber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
    },
    position: {
      type: Number,
      required: [true, 'Queue position is required'],
      min: [1, 'Position must be at least 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['waiting', 'serving', 'completed', 'left'],
        message: '{VALUE} is not a valid queue status',
      },
      default: 'waiting',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    servedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

queueEntrySchema.index({ status: 1, position: 1 });

const QueueEntry = mongoose.model('QueueEntry', queueEntrySchema);

export default QueueEntry;
