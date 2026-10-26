import mongoose from 'mongoose';

const donationRequestSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: [1, 'Requested quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'in_fulfillment', 'delivered'],
      default: 'pending',
    },
    pickupNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

donationRequestSchema.index({ donationId: 1, status: 1 });
donationRequestSchema.index({ ngoId: 1, createdAt: -1 });
donationRequestSchema.index({ donationId: 1, ngoId: 1 });

export const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);
export default DonationRequest;
