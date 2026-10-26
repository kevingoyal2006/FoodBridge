import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Donation from '../src/models/Donation.js';

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('POST /api/v1/auth/register - Successfully registers donor and sets HttpOnly cookie', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Test Donor',
      email: 'donor@test.com',
      password: 'password123',
      role: 'donor',
      organizationName: 'Community Diner',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.user.email, 'donor@test.com');
  assert.equal(res.body.user.role, 'donor');
  assert.equal(res.body.user.passwordHash, undefined); // Password hash must never be returned

  // Verify HttpOnly cookie was set
  const cookies = res.headers['set-cookie'];
  assert.ok(cookies);
  assert.ok(cookies.some((c) => c.includes('foodbridge_token') && c.includes('HttpOnly')));
});

test('POST /api/v1/auth/register - Rejects public self-assignment of admin role with 403', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Malicious Actor',
      email: 'hacker@test.com',
      password: 'password123',
      role: 'admin',
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.error.code, 'FORBIDDEN');
});

test('POST /api/v1/auth/register - Rejects duplicate email with 409 Conflict', async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Duplicate Donor',
      email: 'donor@test.com',
      password: 'password123',
      role: 'donor',
    });

  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'EMAIL_ALREADY_EXISTS');
});

test('POST /api/v1/auth/login - Returns 401 for incorrect password', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'donor@test.com',
      password: 'wrongpassword',
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
});

test('POST /api/v1/auth/login - Successfully logs in with valid credentials', async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'donor@test.com',
      password: 'password123',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, 'donor@test.com');
  assert.ok(res.headers['set-cookie']);
});

test('GET /api/v1/auth/me - Rejects unauthorized request without session cookie with 401', async () => {
  const res = await request(app).get('/api/v1/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'UNAUTHORIZED');
});

test('RBAC - Donor cannot access Admin user directory (403 Forbidden)', async () => {
  // Login as donor to obtain cookie
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'donor@test.com',
      password: 'password123',
    });

  const cookie = loginRes.headers['set-cookie'];

  // Attempt to access admin endpoint
  const adminRes = await request(app)
    .get('/api/v1/admin/users')
    .set('Cookie', cookie);

  assert.equal(adminRes.status, 403);
  assert.equal(adminRes.body.error.code, 'FORBIDDEN');
});

test('NGO Verification Gate - Unverified NGO cannot request donations (403 Forbidden)', async () => {
  // Register NGO (starts with verificationStatus = 'pending')
  const ngoRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Hope Foundation',
      email: 'ngo@hope.org',
      password: 'password123',
      role: 'ngo',
      organizationName: 'Hope Foundation',
    });

  assert.equal(ngoRes.status, 201);
  assert.equal(ngoRes.body.user.verificationStatus, 'pending');
  const ngoCookie = ngoRes.headers['set-cookie'];

  // Donor creates a donation
  const donorLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'donor@test.com',
      password: 'password123',
    });

  const donorCookie = donorLogin.headers['set-cookie'];

  const donationRes = await request(app)
    .post('/api/v1/donations')
    .set('Cookie', donorCookie)
    .send({
      title: 'Surplus Rice & Curry',
      foodCategory: 'Cooked Meals',
      quantity: 20,
      pickupDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      pickupAddress: 'Downtown Diner, 1st Cross',
    });

  assert.equal(donationRes.status, 201);
  const donationId = donationRes.body.donation._id;

  // Unverified NGO attempts to claim food -> must be rejected with 403
  const claimRes = await request(app)
    .post(`/api/v1/donations/${donationId}/requests`)
    .set('Cookie', ngoCookie)
    .send({
      requestedQuantity: 10,
    });

  assert.equal(claimRes.status, 403);
  assert.equal(claimRes.body.error.code, 'NGO_NOT_VERIFIED');
});

test('Admin can verify NGO, enabling subsequent food requests', async () => {
  // Create an admin user directly in DB (as admin registration is blocked publicly)
  const adminPass = await User.hashPassword('admin123');
  const adminUser = await User.create({
    name: 'Platform Admin',
    email: 'admin@system.com',
    passwordHash: adminPass,
    role: 'admin',
    accountStatus: 'active',
  });

  // Admin logs in
  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'admin@system.com',
      password: 'admin123',
    });
  const adminCookie = adminLogin.headers['set-cookie'];

  // Find the pending NGO
  const ngo = await User.findOne({ email: 'ngo@hope.org' });
  assert.ok(ngo);

  // Admin verifies NGO
  const verifyRes = await request(app)
    .patch(`/api/v1/admin/users/${ngo._id}/verification`)
    .set('Cookie', adminCookie)
    .send({
      verificationStatus: 'verified',
      notes: 'Registration documents verified.',
    });

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.user.verificationStatus, 'verified');

  // NGO logs in again and attempts request
  const ngoLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'ngo@hope.org',
      password: 'password123',
    });
  const verifiedNgoCookie = ngoLogin.headers['set-cookie'];

  const donation = await Donation.findOne({ title: 'Surplus Rice & Curry' });
  assert.ok(donation);

  // Now verified, request must succeed!
  const claimRes = await request(app)
    .post(`/api/v1/donations/${donation._id}/requests`)
    .set('Cookie', verifiedNgoCookie)
    .send({
      requestedQuantity: 10,
      pickupNotes: 'Will collect at 3 PM',
    });

  assert.equal(claimRes.status, 201);
  assert.equal(claimRes.body.request.status, 'pending');
});

test('POST /api/v1/auth/logout - Clears session cookie', async () => {
  const res = await request(app).post('/api/v1/auth/logout');
  assert.equal(res.status, 200);
  assert.equal(res.body.message, 'Logged out successfully.');
});
