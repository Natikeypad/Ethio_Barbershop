import mongoose from 'mongoose';

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

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      sparse: true,
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
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'telebirr', 'cbe_birr', 'awash_birr'],
        message: '{VALUE} is not a supported payment method',
      },
    },
    barberCommission: {
      type: Number,
      required: [true, 'Barber commission is required'],
      min: [0, 'Barber commission cannot be negative'],
    },
    shopRevenue: {
      type: Number,
      required: [true, 'Shop revenue is required'],
      min: [0, 'Shop revenue cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    ethiopianDate: {
      type: ethiopianDateSchema,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ date: 1, paymentMethod: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
