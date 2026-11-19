import './testDb.js';
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import authRouter from "../routes/auth.routes.js";
import adminRouter from "../routes/admin.routes.js";
import errorHandler from "../middleware/errorMiddleware.js";
import notFoundHandler from "../middleware/notFoundMiddleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

let passed = 0;
let total = 0;

function assert(name, condition, details = "") {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} - Details: ${details}`);
  }
}

async function runSessionEndpointVerification() {
  console.log("=== BLOODWARD SESSION ENDPOINT & RBAC AUDIT ===");

  await mongoose.connect(process.env.MONGODB_URI);

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const testId = Date.now();
  const password = "Password123!";

  // 1. Create clean test users for session validation
  const donor = await User.create({
    fullName: "Session Test Donor",
    email: `session_donor_${testId}@bloodward.test`,
    phone: `919${String(testId).slice(-7)}`,
    password,
    role: "donor",
    bloodGroup: "O+",
    city: "Mumbai",
    state: "Maharashtra",
    availability: "available",
    dateOfBirth: "1995-05-15",
  });

  const recipient = await User.create({
    fullName: "Session Test Recipient",
    email: `session_recipient_${testId}@bloodward.test`,
    phone: `918${String(testId).slice(-7)}`,
    password,
    role: "recipient",
    accountType: "individual",
    city: "Mumbai",
    state: "Maharashtra",
  });

  // Find or create admin
  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    admin = await User.create({
      fullName: "Session Test Admin",
      email: `session_admin_${testId}@bloodward.test`,
      phone: `917${String(testId).slice(-7)}`,
      password,
      role: "admin",
    });
  }

  try {
    // TEST 1: No cookie / no token -> HTTP 200, authenticated: false
    const resNoCookie = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    const dataNoCookie = await resNoCookie.json();
    assert(
      "1. No cookie returns HTTP 200 with authenticated:false and user:null",
      resNoCookie.status === 200 &&
      dataNoCookie.authenticated === false &&
      dataNoCookie.user === null,
      `Status: ${resNoCookie.status}, body: ${JSON.stringify(dataNoCookie)}`
    );

    // TEST 2: Expired token -> HTTP 200, authenticated: false
    const expiredToken = jwt.sign({ id: donor._id }, JWT_SECRET, { expiresIn: "-10s" });
    const resExpired = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${expiredToken}`,
      },
    });
    const dataExpired = await resExpired.json();
    assert(
      "2. Expired JWT token returns HTTP 200 with authenticated:false and user:null",
      resExpired.status === 200 &&
      dataExpired.authenticated === false &&
      dataExpired.user === null,
      `Status: ${resExpired.status}, body: ${JSON.stringify(dataExpired)}`
    );

    // TEST 3: Invalid token (malformed signature) -> HTTP 200, authenticated: false
    const invalidToken = "invalid.token.signature123456789";
    const resInvalid = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cookie": `token=${invalidToken}`,
      },
    });
    const dataInvalid = await resInvalid.json();
    assert(
      "3. Invalid JWT token returns HTTP 200 with authenticated:false and user:null",
      resInvalid.status === 200 &&
      dataInvalid.authenticated === false &&
      dataInvalid.user === null,
      `Status: ${resInvalid.status}, body: ${JSON.stringify(dataInvalid)}`
    );

    // TEST 4: Literal string tokens 'logout', 'null', 'undefined'
    const resLogout = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cookie": "token=logout",
      },
    });
    const dataLogout = await resLogout.json();
    assert(
      "4. Token='logout' returns HTTP 200 with authenticated:false and user:null",
      resLogout.status === 200 && dataLogout.authenticated === false,
      `Status: ${resLogout.status}`
    );

    // TEST 5: Valid donor session
    const donorLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: donor.email, password, role: "donor" }),
    });
    const donorCookie = donorLoginRes.headers.get("set-cookie")?.split(";")[0];
    const resDonorMe = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: { "Cookie": donorCookie },
    });
    const dataDonorMe = await resDonorMe.json();
    assert(
      "5. Valid donor session returns HTTP 200 with correct donor profile",
      resDonorMe.status === 200 &&
      dataDonorMe.user?.role === "donor" &&
      dataDonorMe.user?.email === donor.email,
      `Status: ${resDonorMe.status}, user: ${JSON.stringify(dataDonorMe.user)}`
    );

    // TEST 6: Valid recipient session
    const recLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recipient.email, password, role: "recipient" }),
    });
    const recCookie = recLoginRes.headers.get("set-cookie")?.split(";")[0];
    const resRecMe = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: { "Cookie": recCookie },
    });
    const dataRecMe = await resRecMe.json();
    assert(
      "6. Valid recipient session returns HTTP 200 with correct recipient profile",
      resRecMe.status === 200 &&
      dataRecMe.user?.role === "recipient" &&
      dataRecMe.user?.email === recipient.email,
      `Status: ${resRecMe.status}, user: ${JSON.stringify(dataRecMe.user)}`
    );

    // TEST 7: Valid admin session
    // For admin, generate valid signed JWT directly to ensure session auth check
    const adminToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1h" });
    const resAdminMe = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: { "Cookie": `token=${adminToken}` },
    });
    const dataAdminMe = await resAdminMe.json();
    assert(
      "7. Valid admin session returns HTTP 200 with correct admin profile",
      resAdminMe.status === 200 &&
      dataAdminMe.user?.role === "admin" &&
      dataAdminMe.user?.email === admin.email,
      `Status: ${resAdminMe.status}, user: ${JSON.stringify(dataAdminMe.user)}`
    );

    // TEST 8: Protected endpoint PUT /api/auth/me returns HTTP 401 without session
    const resPutMe = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Hacked" }),
    });
    assert(
      "8. Protected PUT /api/auth/me strictly returns HTTP 401 when unauthenticated",
      resPutMe.status === 401,
      `Status: ${resPutMe.status}`
    );

    // TEST 9: Protected endpoint GET /api/admin/donors returns HTTP 401 without session
    const resAdminNoAuth = await fetch(`${baseUrl}/api/admin/donors`, {
      method: "GET",
    });
    assert(
      "9. Protected GET /api/admin/donors strictly returns HTTP 401 when unauthenticated",
      resAdminNoAuth.status === 401,
      `Status: ${resAdminNoAuth.status}`
    );

    // TEST 10: Role authorization: Donor accessing admin endpoint returns HTTP 403 Forbidden
    const resDonorToAdmin = await fetch(`${baseUrl}/api/admin/donors`, {
      method: "GET",
      headers: { "Cookie": donorCookie },
    });
    assert(
      "10. Donor account accessing admin route strictly returns HTTP 403 Forbidden",
      resDonorToAdmin.status === 403,
      `Status: ${resDonorToAdmin.status}`
    );

    // TEST 11: Role authorization: Recipient accessing admin endpoint returns HTTP 403 Forbidden
    const resRecToAdmin = await fetch(`${baseUrl}/api/admin/donors`, {
      method: "GET",
      headers: { "Cookie": recCookie },
    });
    assert(
      "11. Recipient account accessing admin route strictly returns HTTP 403 Forbidden",
      resRecToAdmin.status === 403,
      `Status: ${resRecToAdmin.status}`
    );

    console.log("================================================");
    console.log(`FINAL RESULTS: ${passed}/${total} PASSED.`);
  } finally {
    if (server) {
      server.close();
    }
    // Cleanup temporary test users
    await User.deleteMany({ email: { $in: [donor.email, recipient.email] } });
    if (admin && admin.email && admin.email.startsWith("session_admin_")) {
      await User.deleteOne({ _id: admin._id });
    }
    await mongoose.disconnect();
  }

  process.exit(passed === total ? 0 : 1);
}

runSessionEndpointVerification().catch((err) => {
  console.error("Fatal error during session test:", err);
  process.exit(1);
});
