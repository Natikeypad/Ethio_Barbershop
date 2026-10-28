import mongoose from 'mongoose';

const barberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Barber name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    specialties: {
      type: [String],
      default: ['Fade', 'Beard Trim'],
    },
    commissionRate: {
      type: Number,
      required: [true, 'Commission rate is required'],
      default: 50,
      min: [0, 'Commission rate cannot be less than 0%'],
      max: [100, 'Commission rate cannot exceed 100%'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Barber = mongoose.model('Barber', barberSchema);

export default Barber;
