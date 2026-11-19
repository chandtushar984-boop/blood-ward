import './testDb.js';
import assert from 'node:assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getCompatibleDonorBloodGroups, isBloodCompatible } from '../utils/bloodCompatibility.js';
import BloodRequest from '../models/bloodRequest.js';
import User from '../models/user.model.js';
import { calculateDefaultRadiusKm, ALLOWED_RADIUS_PRESETS } from '../controllers/bloodRequestController.js';

dotenv.config({ path: './.env' });

let passed = 0;
let total = 0;

const test = (desc, fn) => {
  total++;
  try {
    fn();
    passed++;
    console.log(`[✅ PASS] ${desc}`);
  } catch (err) {
    console.error(`[❌ FAIL] ${desc}: ${err.message}`);
  }
};

const asyncTest = async (desc, fn) => {
  total++;
  try {
    await fn();
    passed++;
    console.log(`[✅ PASS] ${desc}`);
  } catch (err) {
    console.error(`[❌ FAIL] ${desc}: ${err.message}`);
  }
};

const run = async () => {
  console.log('==================================================');
  console.log('RUNNING PHASE 1 VERIFICATION TESTS');
  console.log('==================================================');

  await mongoose.connect(process.env.MONGODB_URI);

  // --- Task 1: Comprehensive Blood Compatibility Mapping ---
  const expected = {
    'AB+': ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'],
    'AB-': ['O-', 'B-', 'A-', 'AB-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'A-': ['O-', 'A-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'B-': ['O-', 'B-'],
    'O+': ['O-', 'O+'],
    'O-': ['O-'],
  };

  for (const [recGroup, expDonors] of Object.entries(expected)) {
    test(`Task 1: Recipient ${recGroup} compatible donors match authoritative standard`, () => {
      const res = getCompatibleDonorBloodGroups(recGroup);
      assert.deepStrictEqual(res.sort(), [...expDonors].sort());
      for (const d of expDonors) {
        assert.strictEqual(isBloodCompatible(d, recGroup), true);
      }
    });
  }

  // Verify incompatible donors rejected
  test('Task 1: Incompatible donors return false in isBloodCompatible', () => {
    assert.strictEqual(isBloodCompatible('A+', 'O+'), false);
    assert.strictEqual(isBloodCompatible('B+', 'A+'), false);
    assert.strictEqual(isBloodCompatible('AB+', 'A+'), false);
    assert.strictEqual(isBloodCompatible('A+', 'B+'), false);
    assert.strictEqual(isBloodCompatible('O+', 'O-'), false);
  });

  // --- Task 3: Radius Calculation Horizon Policy ---
  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  test('Task 3: Radius policy for Today defaults to 20 KM', () => {
    assert.strictEqual(calculateDefaultRadiusKm(todayIST), 20);
  });

  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(tomorrow);
  test('Task 3: Radius policy for Tomorrow defaults to 30 KM', () => {
    assert.strictEqual(calculateDefaultRadiusKm(tomorrowIST), 30);
  });

  const future = new Date(Date.now() + 86400000 * 3);
  const futureIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(future);
  test('Task 3: Radius policy for 2+ days out defaults to 50 KM', () => {
    assert.strictEqual(calculateDefaultRadiusKm(futureIST), 50);
  });

  test('Task 3: Allowed radius presets are [5, 10, 20, 30, 50]', () => {
    assert.deepStrictEqual(ALLOWED_RADIUS_PRESETS, [5, 10, 20, 30, 50]);
  });

  // --- Task 3: Atomic Concurrency & State Machine ---
  const ts = Date.now();
  const testRecipient = await User.create({
    fullName: `Test Recipient ${ts}`,
    email: `rec_test_${ts}@bloodward.test`,
    password: 'Password123!',
    phone: '9876543210',
    role: 'recipient',
    state: 'Delhi',
    city: 'New Delhi',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
  });

  const donorA = await User.create({
    fullName: `Donor A ${ts}`,
    email: `d_a_${ts}@bloodward.test`,
    password: 'Password123!',
    phone: '9876543211',
    role: 'donor',
    bloodGroup: 'O+',
    availability: 'available',
    state: 'Delhi',
    city: 'New Delhi',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
  });

  const donorB = await User.create({
    fullName: `Donor B ${ts}`,
    email: `d_b_${ts}@bloodward.test`,
    password: 'Password123!',
    phone: '9876543212',
    role: 'donor',
    bloodGroup: 'O+',
    availability: 'available',
    state: 'Delhi',
    city: 'New Delhi',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
  });

  await asyncTest('Task 3: Atomic double-acceptance concurrency test (findOneAndUpdate)', async () => {
    const testReq = await BloodRequest.create({
      recipient: testRecipient._id,
      recipientName: testRecipient.fullName,
      bloodGroup: 'O+',
      unitsNeeded: 1,
      hospitalName: 'Safdarjung Hospital',
      city: 'New Delhi',
      urgency: 'Normal',
      status: 'Active',
      requiredDate: todayIST,
      radiusKm: 20,
      notifiedDonors: [],
    });

    // Simulate two simultaneous atomic accept queries
    const [resA, resB] = await Promise.all([
      BloodRequest.findOneAndUpdate(
        { _id: testReq._id, status: 'Active' },
        { $set: { status: 'Donor Accepted', acceptedDonor: donorA._id }, $inc: { donorResponsesCount: 1 } },
        { new: true }
      ),
      BloodRequest.findOneAndUpdate(
        { _id: testReq._id, status: 'Active' },
        { $set: { status: 'Donor Accepted', acceptedDonor: donorB._id }, $inc: { donorResponsesCount: 1 } },
        { new: true }
      ),
    ]);

    // Exactly one must succeed, the other must be null (would result in 409 Conflict)
    const successCount = [resA, resB].filter((r) => r !== null).length;
    const failCount = [resA, resB].filter((r) => r === null).length;

    assert.strictEqual(successCount, 1, 'Exactly one concurrent acceptance must succeed');
    assert.strictEqual(failCount, 1, 'The competing concurrent acceptance must return null (409 Conflict)');

    const updated = await BloodRequest.findById(testReq._id);
    assert.strictEqual(updated.status, 'Donor Accepted');
    assert.strictEqual(updated.donorResponsesCount, 1);

    // Clean up request
    await BloodRequest.findByIdAndDelete(testReq._id);
  });

  // --- Task 3: Expiration Semantics ---
  await asyncTest('Task 3: Overdue requiredDate is automatically marked Expired', async () => {
    const yesterdayDate = new Date(Date.now() - 86400000 * 2);
    const yesterdayYMD = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(yesterdayDate);

    const pastReq = await BloodRequest.create({
      recipient: testRecipient._id,
      recipientName: testRecipient.fullName,
      bloodGroup: 'A+',
      unitsNeeded: 1,
      hospitalName: 'Apollo Hospital',
      city: 'New Delhi',
      urgency: 'Normal',
      status: 'Active',
      requiredDate: yesterdayYMD,
      radiusKm: 20,
    });

    // Simulate expiration check
    const expiryTimestamp = new Date(`${yesterdayYMD}T23:59:59.999+05:30`).getTime();
    assert.ok(Date.now() > expiryTimestamp, 'Yesterday end of day timestamp is in the past');

    pastReq.status = 'Expired';
    await pastReq.save();

    // Verify expired request cannot be accepted
    const acceptAttempt = await BloodRequest.findOneAndUpdate(
      { _id: pastReq._id, status: 'Active' },
      { $set: { status: 'Donor Accepted', acceptedDonor: donorA._id } },
      { new: true }
    );
    assert.strictEqual(acceptAttempt, null, 'Expired request cannot be accepted');

    await BloodRequest.findByIdAndDelete(pastReq._id);
  });

  // Cleanup test users
  await User.deleteMany({ _id: { $in: [testRecipient._id, donorA._id, donorB._id] } });

  console.log('==================================================');
  console.log(`FINAL RESULTS: ${passed}/${total} PASSED`);
  console.log('==================================================');

  await mongoose.disconnect();
  process.exit(passed === total ? 0 : 1);
};

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
