import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    nameAmharic: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price must be greater than or equal to 0 ETB'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      default: 30,
      min: [1, 'Duration must be at least 1 minute'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['haircut', 'beard', 'combo', 'kids', 'specialty'],
        message: '{VALUE} is not a valid category',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
