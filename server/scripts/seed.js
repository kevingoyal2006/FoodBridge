import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import Donation from '../src/models/Donation.js';
import DonationRequest from '../src/models/DonationRequest.js';
import Pickup from '../src/models/Pickup.js';
import Notification from '../src/models/Notification.js';
import AuditLog from '../src/models/AuditLog.js';

export async function seedDatabase(mongoUri = env.MONGODB_URI) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('🌱 Starting FoodBridge database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Donation.deleteMany({}),
      DonationRequest.deleteMany({}),
      Pickup.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Create Users with pre-hashed passwords
    const adminPass = await User.hashPassword('Admin@123');
    const donorPass = await User.hashPassword('Donor@123');
    const ngoPass = await User.hashPassword('Ngo@123');
    const volunteerPass = await User.hashPassword('Volunteer@123');

    const admin = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'admin@foodbridge.org',
      passwordHash: adminPass,
      role: 'admin',
      organizationName: 'FoodBridge Central Administration',
      phone: '+1 555-0100',
      address: '742 Evergreen Terrace, Sector 4',
      verificationStatus: 'not_required',
      accountStatus: 'active',
    });

    const donor = await User.create({
      name: 'Chef Marcus Vance',
      email: 'donor@freshbites.com',
      passwordHash: donorPass,
      role: 'donor',
      organizationName: 'FreshBites Artisan Bakery & Bistro',
      phone: '+1 555-0144',
      address: '124 Market Square, Downtown Plaza',
      verificationStatus: 'not_required',
      accountStatus: 'active',
    });

    const verifiedNgo = await User.create({
      name: 'Elena Rostova',
      email: 'ngo@carefeed.org',
      passwordHash: ngoPass,
      role: 'ngo',
      organizationName: 'CareFeed Foundation',
      registrationNumber: 'NGO-DEL-2023-8941',
      phone: '+1 555-0188',
      address: '45 Compassion Ave, North District',
      verificationStatus: 'verified',
      verificationNotes: 'Registered charitable trust with verified food distribution center.',
      accountStatus: 'active',
    });

    const pendingNgo = await User.create({
      name: 'Aiden Brooks',
      email: 'pending@hopecommunity.org',
      passwordHash: ngoPass,
      role: 'ngo',
      organizationName: 'Hope Community Shelter',
      registrationNumber: 'NGO-BLR-2024-1102',
      phone: '+1 555-0199',
      address: '88 Sunset Boulevard, East Wing',
      verificationStatus: 'pending',
      accountStatus: 'active',
    });

    const volunteer = await User.create({
      name: 'David Chen',
      email: 'volunteer@swiftrescue.org',
      passwordHash: volunteerPass,
      role: 'volunteer',
      organizationName: 'GreenWheels Volunteer Brigade',
      phone: '+1 555-0166',
      address: '302 University Road',
      verificationStatus: 'not_required',
      accountStatus: 'active',
    });

    // 2. Create Sample Donations
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const inTwoDays = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const donation1 = await Donation.create({
      donorId: donor._id,
      title: '50 Fresh Vegetarian Lunch Boxes',
      description: 'Rice, lentils (dal), mixed vegetables, and handmade chapatis prepared for corporate catering. Hygienically packaged in foil containers.',
      foodCategory: 'Cooked Meals',
      foodType: 'vegetarian',
      quantity: 50,
      quantityAvailable: 50,
      unit: 'meals',
      pickupDeadline: tomorrow,
      storageInstructions: 'Keep warm or refrigerate immediately upon collection.',
      allergenInformation: ['Gluten (Wheat Chapatis)', 'Dairy (Ghee)'],
      pickupAddress: 'FreshBites Bistro, 124 Market Square',
      city: 'Central Metro',
      status: 'available',
    });

    const donation2 = await Donation.create({
      donorId: donor._id,
      title: '30 kg Fresh Bakery Bread & Bagels',
      description: 'Assorted artisan sourdough, baguettes, and whole wheat bread baked this morning.',
      foodCategory: 'Baked Goods',
      foodType: 'vegan',
      quantity: 30,
      quantityAvailable: 0,
      unit: 'kg',
      pickupDeadline: inTwoDays,
      storageInstructions: 'Store in dry ambient conditions.',
      allergenInformation: ['Gluten'],
      pickupAddress: 'FreshBites Artisan Bakery, 124 Market Square',
      city: 'Central Metro',
      status: 'reserved',
    });

    // 3. Create Sample Request & Pickup for Donation 2
    const request = await DonationRequest.create({
      donationId: donation2._id,
      ngoId: verifiedNgo._id,
      requestedQuantity: 30,
      status: 'approved',
      pickupNotes: 'Our volunteer will bring sanitized thermal crates.',
      reviewedBy: donor._id,
      reviewedAt: new Date(),
    });

    await Pickup.create({
      donationId: donation2._id,
      requestId: request._id,
      volunteerId: volunteer._id,
      status: 'assigned',
      assignedAt: new Date(),
    });

    // 4. Sample Notifications
    await Notification.create({
      userId: verifiedNgo._id,
      title: 'Welcome to FoodBridge! 🎉',
      message: 'Your organization credentials have been verified. You can browse and claim surplus food listings.',
      type: 'verification',
      relatedEntityType: 'user',
      relatedEntityId: verifiedNgo._id,
    });

    console.log('✅ Seed completed successfully!');
    console.log(`
      Demo Accounts Created:
      ---------------------------------------------------------
      👑 Admin     : admin@foodbridge.org       / Admin@123
      🍲 Donor     : donor@freshbites.com       / Donor@123
      🏢 NGO (OK)  : ngo@carefeed.org           / Ngo@123
      ⏳ NGO (Wait): pending@hopecommunity.org   / Ngo@123
      🚚 Volunteer : volunteer@swiftrescue.org   / Volunteer@123
      ---------------------------------------------------------
    `);

    return { admin, donor, verifiedNgo, pendingNgo, volunteer };
  } catch (err) {
    console.error('❌ Seeding error:', err);
    throw err;
  }
}

// Run directly if called from command line
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;
