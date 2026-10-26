import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['unassigned', 'assigned', 'picked_up', 'delivered', 'cancelled', 'failed'],
      default: 'unassigned',
    },
    assignedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

pickupSchema.index({ volunteerId: 1, status: 1 });
pickupSchema.index({ requestId: 1 });

export const Pickup = mongoose.model('Pickup', pickupSchema);
export default Pickup;
