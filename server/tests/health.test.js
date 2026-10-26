import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('GET / returns API welcome information', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.name, 'FoodBridge REST API');
  assert.equal(res.body.version, '1.0.0');
});

test('GET /health returns health payload with database state and uptime', async () => {
  const res = await request(app).get('/health');
  // Returns 200 if connected or 503 if DB in standby, but response structure is always complete
  assert.ok([200, 503].includes(res.status));
  assert.ok(res.body.service);
  assert.ok(res.body.version);
  assert.ok(res.body.timestamp);
  assert.ok(typeof res.body.uptimeSeconds === 'number');
  assert.ok(res.body.database);
});

test('GET /api/v1/health matches /health payload', async () => {
  const res = await request(app).get('/api/v1/health');
  assert.ok([200, 503].includes(res.status));
  assert.equal(res.body.service, 'FoodBridge REST API');
});

test('GET /unknown-endpoint returns standard 404 error envelope', async () => {
  const res = await request(app).get('/api/v1/non-existent-route');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
  assert.ok(res.body.error.message);
});
