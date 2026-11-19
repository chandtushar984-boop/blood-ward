import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['1.1.1.1', '8.8.8.8']);

/**
 * Safely extracts the database name from a MongoDB connection URI.
 * Never logs or exposes credentials.
 */
export function getDatabaseNameFromUri(uri) {
  if (!uri || typeof uri !== 'string') return null;
  const match = uri.match(/\/([^/?#]+)(\?|$)/);
  return match ? match[1] : null;
}

/**
 * Hard safety guard that prevents running automated tests against the production 'bloodward' database.
 */
export function validateDatabaseSafety(uri, isTest = false) {
  if (!uri) {
    if (isTest) {
      throw new Error(
        'SAFETY GUARD ACTIVATED: MONGODB_TEST_URI is required to run automated tests.\n' +
        'Automated tests must run against an isolated test database (e.g. bloodward_test).\n' +
        'Refusing to run tests against the production database.'
      );
    }
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const dbName = getDatabaseNameFromUri(uri);
  if (isTest) {
    if (!dbName) {
      throw new Error(
        'SAFETY GUARD ACTIVATED: Invalid test database URI structure. Unable to verify database name.'
      );
    }
    if (dbName.toLowerCase() === 'bloodward') {
      throw new Error(
        `SAFETY GUARD ACTIVATED: Refusing to execute tests against production database '${dbName}'.\n` +
        `Automated tests must run against a dedicated test database (e.g. 'bloodward_test').`
      );
    }
  }

  return dbName;
}

const connectDB = async () => {
  try {
    const isTest = process.env.NODE_ENV === 'test';
    let mongoUri;

    if (isTest) {
      if (!process.env.MONGODB_TEST_URI) {
        throw new Error(
          'SAFETY GUARD ACTIVATED: MONGODB_TEST_URI is required to run tests.\n' +
          'Refusing to silently fall back to production MONGODB_URI.\n' +
          'Configure MONGODB_TEST_URI in server/.env pointing to an isolated test database (e.g. bloodward_test).'
        );
      }
      mongoUri = process.env.MONGODB_TEST_URI;
      validateDatabaseSafety(mongoUri, true);
    } else {
      mongoUri = process.env.MONGODB_URI;
      validateDatabaseSafety(mongoUri, false);
    }

    const conn = await mongoose.connect(mongoUri);
    const dbName = conn.connection.name || getDatabaseNameFromUri(mongoUri);
    console.log(`MongoDB connected successfully [DB: ${dbName}]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB: ' + error.message);
    process.exit(1);
  }
};

export default connectDB;
