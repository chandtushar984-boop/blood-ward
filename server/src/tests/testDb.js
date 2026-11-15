import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { getDatabaseNameFromUri, validateDatabaseSafety } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// Ensure server/.env is loaded
dotenv.config({ path: envPath });

/**
 * Returns the validated test database URI.
 * Throws a descriptive error if missing or if pointing to production.
 */
export function getTestMongoUri() {
  const testUri = process.env.MONGODB_TEST_URI;
  if (!testUri) {
    throw new Error(
      'SAFETY GUARD ACTIVATED: MONGODB_TEST_URI is required to run automated tests.\n' +
      'Refusing to silently fall back to MONGODB_URI.\n' +
      'Automated tests must run against an isolated test database (e.g. bloodward_test).\n' +
      'Please define MONGODB_TEST_URI in server/.env.'
    );
  }

  validateDatabaseSafety(testUri, true);
  return testUri;
}

/**
 * Enforces test environment variables and intercepts mongoose.connect to prevent
 * accidental connection to production under any circumstance.
 */
export function enforceTestEnvironment() {
  process.env.NODE_ENV = 'test';
  const testUri = getTestMongoUri();

  // Redirect MONGODB_URI to testUri so any legacy code reading MONGODB_URI connects to test DB
  process.env.MONGODB_URI = testUri;

  // Intercept mongoose.connect to guard every call
  if (!mongoose._isSafetyGuardInstalled) {
    const rawConnect = mongoose.connect.bind(mongoose);
    mongoose.connect = async function (uri, ...rest) {
      const targetUri = uri || process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;
      validateDatabaseSafety(targetUri, true);
      return rawConnect(targetUri, ...rest);
    };
    mongoose._isSafetyGuardInstalled = true;
  }

  return testUri;
}

/**
 * Connects directly to the dedicated test database with safety verification.
 */
export async function connectTestDB() {
  const testUri = enforceTestEnvironment();
  const conn = await mongoose.connect(testUri);
  const dbName = conn.connection.name || getDatabaseNameFromUri(testUri);
  console.log(`[TEST DB] Connected safely to isolated test database: ${dbName}`);
  return conn;
}

// Automatically enforce test environment when testDb.js is imported
enforceTestEnvironment();
