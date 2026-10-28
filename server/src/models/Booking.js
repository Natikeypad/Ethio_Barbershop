import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
  },
  { _id: false }
);

const ethiopianDateSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 13,
    },
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: customerSchema,
      required: [true, 'Customer information is required'],
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: [true, 'Barber reference is required'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    source: {
      type: String,
      enum: {
        values: ['walk-in', 'phone', 'online'],
        message: '{VALUE} is not a valid booking source',
      },
      default: 'walk-in',
    },
    ethiopianDate: {
      type: ethiopianDateSchema,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ barber: 1, startTime: 1, endTime: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
