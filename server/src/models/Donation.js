import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Donation title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    foodCategory: {
      type: String,
      required: [true, 'Food category is required'],
      enum: ['Cooked Meals', 'Raw Groceries', 'Baked Goods', 'Dairy & Produce', 'Packaged Food', 'Other'],
      default: 'Cooked Meals',
    },
    foodType: {
      type: String,
      enum: ['vegetarian', 'non_vegetarian', 'vegan', 'other'],
      default: 'vegetarian',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['meals', 'kg', 'packets', 'items'],
      default: 'meals',
    },
    quantityAvailable: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },
    preparedAt: {
      type: Date,
      default: Date.now,
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Pickup deadline is required'],
    },
    storageInstructions: {
      type: String,
      trim: true,
      default: 'Keep refrigerated or consume promptly.',
    },
    allergenInformation: {
      type: [String],
      default: [],
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: 'Local',
    },
    status: {
      type: String,
      enum: ['draft', 'available', 'reserved', 'partially_reserved', 'completed', 'cancelled', 'expired'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

donationSchema.index({ status: 1, pickupDeadline: 1 });
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ foodCategory: 1, status: 1 });

export const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
