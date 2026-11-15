import './testDb.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import donorRouter from '../routes/donor.routes.js';
import authRouter from '../routes/auth.routes.js';
import notFoundHandler from '../middleware/notFoundMiddleware.js';
import errorHandler from '../middleware/errorMiddleware.js';
import sanitizeMiddleware from '../middleware/sanitizeMiddleware.js';
import {
  DONOR_TO_RECIPIENT_MAP,
  getCompatibleDonorBloodGroups,
  isBloodCompatible,
} from '../utils/bloodCompatibility.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(sanitizeMiddleware);
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/donors', donorRouter);
app.use(notFoundHandler);
app.use(errorHandler);

let passed = 0;
let failed = 0;

function assert(description, condition, actualOutput = '') {
  if (condition) {
    console.log(`TEST: ${description} [✅ PASS]`);
    passed++;
  } else {
    console.error(`TEST: ${description} [❌ FAIL]`);
    if (actualOutput) {
      console.error(`       Details: ${actualOutput}`);
    }
    failed++;
  }
}

async function runCompatibilitySuite() {
  console.log('=== RECIPIENT DONOR-SEARCH BLOOD COMPATIBILITY SUITE ===');
  await connectDB();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      // Non-JSON response
    }
    return { status: res.status, data, headers: res.headers };
  };

  // Clean up any test records from previous runs
  await User.deleteMany({ email: { $regex: 'test_compat@bloodward.test', $options: 'i' } });

  const password = 'Password123!';
  const ALL_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  try {
    // 1. Create a Recipient user
    const recipientUser = await User.create({
      fullName: 'Compatibility Test Recipient',
      email: 'recipient_test_compat@bloodward.test',
      phone: '9876543200',
      password,
      role: 'recipient',
      city: 'Delhi',
      state: 'Delhi',
    });

    // Login as Recipient to acquire auth cookie
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recipientUser.email, password, role: 'recipient' }),
    });
    const recipientCookie = loginRes.headers.get('set-cookie');
    assert('1. Recipient login succeeds', loginRes.status === 200 && !!recipientCookie);

    // 2. Seed active available donors for all 8 blood groups in Delhi (28.6139, 77.2090)
    const seededDonors = {};
    for (let i = 0; i < ALL_BLOOD_GROUPS.length; i++) {
      const bg = ALL_BLOOD_GROUPS[i];
      const safeTag = bg.replace('+', 'pos').replace('-', 'neg');
      const donor = await User.create({
        fullName: `Donor_${safeTag}`,
        email: `donor_${safeTag}_test_compat@bloodward.test`,
        phone: `987654321${i}`,
        password,
        role: 'donor',
        bloodGroup: bg,
        availability: 'available',
        city: 'Delhi',
        state: 'Delhi',
        location: { type: 'Point', coordinates: [77.2090 + i * 0.001, 28.6139 + i * 0.001] },
        lastActiveAt: new Date(Date.now() - i * 60000),
      });
      seededDonors[bg] = donor;
    }
    assert('2. Seeded 8 available donors across all blood groups in Delhi', Object.keys(seededDonors).length === 8);

    // 3. Seed an unavailable donor and a blocked donor with compatible blood group (O-)
    const unavailableDonor = await User.create({
      fullName: 'Unavailable_O_neg',
      email: 'donor_unavail_test_compat@bloodward.test',
      phone: '9876543290',
      password,
      role: 'donor',
      bloodGroup: 'O-',
      availability: 'not_available',
      city: 'Delhi',
      state: 'Delhi',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    });

    const blockedDonor = await User.create({
      fullName: 'Blocked_O_neg',
      email: 'donor_blocked_test_compat@bloodward.test',
      phone: '9876543291',
      password,
      role: 'donor',
      bloodGroup: 'O-',
      availability: 'available',
      isBlocked: true,
      city: 'Delhi',
      state: 'Delhi',
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    });
    assert('3. Seeded unavailable and blocked control donors', !!unavailableDonor && !!blockedDonor);

    // 4. Test donor compatibility for ALL 8 recipient blood groups
    for (const recipientGroup of ALL_BLOOD_GROUPS) {
      const expectedDonorGroups = getCompatibleDonorBloodGroups(recipientGroup);
      const encodedGroup = encodeURIComponent(recipientGroup);

      const searchRes = await request(`/api/donors/search?bloodGroup=${encodedGroup}&radius=any`, {
        headers: { Cookie: recipientCookie },
      });

      assert(
        `4.${recipientGroup}. HTTP 200 for recipient bloodGroup=${recipientGroup}`,
        searchRes.status === 200 && searchRes.data && searchRes.data.success === true,
        JSON.stringify(searchRes.data)
      );

      const returnedDonors = searchRes.data.donors || [];
      const returnedGroups = returnedDonors.map((d) => d.bloodGroup);

      // Verify every returned donor is clinically compatible
      const allReturnedAreCompatible = returnedDonors.every((d) =>
        isBloodCompatible(d.bloodGroup, recipientGroup)
      );
      assert(
        `4.${recipientGroup}.a All returned donors are clinically compatible with ${recipientGroup}`,
        allReturnedAreCompatible,
        `Returned: ${returnedGroups.join(', ')} | Expected compatible subset: ${expectedDonorGroups.join(', ')}`
      );

      // Verify NO incompatible donor is returned
      const incompatibleGroups = ALL_BLOOD_GROUPS.filter((bg) => !expectedDonorGroups.includes(bg));
      const hasIncompatible = returnedDonors.some((d) => incompatibleGroups.includes(d.bloodGroup));
      assert(
        `4.${recipientGroup}.b Incompatible donors strictly excluded for ${recipientGroup} (${incompatibleGroups.join(', ') || 'None'})`,
        !hasIncompatible,
        `Found incompatible in: ${returnedGroups.join(', ')}`
      );

      // Verify all expected available compatible donors in Delhi are present
      const returnedNames = returnedDonors.map((d) => d.fullName);
      const allExpectedSeededPresent = expectedDonorGroups.every((bg) => {
        const expectedName = seededDonors[bg].fullName;
        return returnedNames.includes(expectedName);
      });
      assert(
        `4.${recipientGroup}.c All available compatible donors found for ${recipientGroup} (${expectedDonorGroups.join(', ')})`,
        allExpectedSeededPresent,
        `Expected ${expectedDonorGroups.length} donors, got ${returnedDonors.length}`
      );

      // Verify unavailable and blocked donors are NEVER returned even though their blood group (O-) is compatible
      const hasUnavailable = returnedNames.includes(unavailableDonor.fullName);
      const hasBlocked = returnedNames.includes(blockedDonor.fullName);
      assert(
        `4.${recipientGroup}.d Unavailable and blocked donors excluded for ${recipientGroup}`,
        !hasUnavailable && !hasBlocked,
        `Unavailable in results: ${hasUnavailable}, Blocked in results: ${hasBlocked}`
      );
    }

    // 5. Test radius/distance filter with compatible donors (Mumbai donor outside Delhi radius)
    const mumbaiDonor = await User.create({
      fullName: 'Mumbai_O_neg_Donor',
      email: 'donor_mumbai_test_compat@bloodward.test',
      phone: '9876543292',
      password,
      role: 'donor',
      bloodGroup: 'O-',
      availability: 'available',
      city: 'Mumbai',
      state: 'Maharashtra',
      location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    });

    // Recipient A+ searching in Delhi within 20km:
    // Should return Delhi compatible donors (O-, O+, A-, A+), but EXCLUDE Mumbai O- donor
    const radiusRes = await request(
      '/api/donors/search?latitude=28.6139&longitude=77.2090&radius=20&bloodGroup=A%2B',
      { headers: { Cookie: recipientCookie } }
    );
    assert('5.a Radius search returns HTTP 200', radiusRes.status === 200);
    const radiusDonors = radiusRes.data.donors || [];
    const mumbaiIncluded = radiusDonors.some((d) => d.fullName === mumbaiDonor.fullName);
    const delhiIncluded = radiusDonors.some((d) => d.fullName === seededDonors['A+'].fullName);
    assert('5.b Compatible donor outside radius (Mumbai) is excluded', !mumbaiIncluded);
    assert('5.c Compatible donor inside radius (Delhi) is included', delhiIncluded);

    // 6. Test sorting with compatible donors
    const sortNearestRes = await request(
      '/api/donors/search?latitude=28.6139&longitude=77.2090&radius=any&bloodGroup=A%2B&sort=nearest',
      { headers: { Cookie: recipientCookie } }
    );
    const nearestDonors = sortNearestRes.data.donors || [];
    let isNearestSorted = true;
    for (let i = 1; i < nearestDonors.length; i++) {
      if (nearestDonors[i].distanceKm < nearestDonors[i - 1].distanceKm) {
        isNearestSorted = false;
        break;
      }
    }
    assert('6. Compatible donors sorted by nearest distance', isNearestSorted && nearestDonors.length > 1);

    // 7. Test pagination with compatible donors
    const page1Res = await request(
      '/api/donors/search?radius=any&bloodGroup=AB%2B&limit=3&page=1',
      { headers: { Cookie: recipientCookie } }
    );
    const page2Res = await request(
      '/api/donors/search?radius=any&bloodGroup=AB%2B&limit=3&page=2',
      { headers: { Cookie: recipientCookie } }
    );
    assert('7.a Pagination limit=3 returns at most 3 donors', page1Res.data.donors.length === 3);
    assert('7.b Pagination page 2 returns distinct donors',
      page2Res.data.donors.length > 0 &&
      page2Res.data.donors[0].id !== page1Res.data.donors[0].id
    );

    // 8. Test bloodGroup omitted returns all available unblocked donors
    const allGroupsRes = await request('/api/donors/search?radius=any', {
      headers: { Cookie: recipientCookie },
    });
    assert('8. Omitted bloodGroup returns all available donors',
      allGroupsRes.status === 200 && allGroupsRes.data.donors.length >= 8
    );

    // 9. Test invalid blood group rejected with HTTP 400
    const invalidGroupRes = await request('/api/donors/search?bloodGroup=INVALID', {
      headers: { Cookie: recipientCookie },
    });
    assert('9. Invalid blood group rejected with HTTP 400', invalidGroupRes.status === 400);

  } catch (err) {
    console.error('Unexpected error in compatibility test suite:', err);
    failed++;
  } finally {
    // Database cleanup
    await User.deleteMany({ email: { $regex: 'test_compat@bloodward.test', $options: 'i' } });
    server.close();
    await mongoose.connection.close();
    console.log(`===================================
FINAL RESULTS: ${passed}/${passed + failed} PASSED.`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runCompatibilitySuite();
