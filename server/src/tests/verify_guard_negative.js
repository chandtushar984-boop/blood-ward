import { validateDatabaseSafety } from '../config/db.js';

console.log('Testing hard safety guard behavior...');

// Case 1: Refuse when MONGODB_TEST_URI is missing
try {
  validateDatabaseSafety(null, true);
  console.error('[FAIL] Guard allowed null URI in test mode');
  process.exit(1);
} catch (err) {
  if (err.message.includes('SAFETY GUARD ACTIVATED')) {
    console.log('[PASS] Guard rejected null test URI correctly:', err.message.split('\n')[0]);
  } else {
    console.error('[FAIL] Unexpected error message:', err.message);
    process.exit(1);
  }
}

// Case 2: Refuse when URI points to production 'bloodward'
try {
  validateDatabaseSafety('mongodb+srv://user:pass@cluster.mongodb.net/bloodward?retryWrites=true&w=majority', true);
  console.error('[FAIL] Guard allowed production URI in test mode');
  process.exit(1);
} catch (err) {
  if (err.message.includes("Refusing to execute tests against production database 'bloodward'")) {
    console.log('[PASS] Guard rejected production database in test mode correctly:', err.message.split('\n')[0]);
  } else {
    console.error('[FAIL] Unexpected error message:', err.message);
    process.exit(1);
  }
}

// Case 3: Allow dedicated test database
try {
  const dbName = validateDatabaseSafety('mongodb+srv://user:pass@cluster.mongodb.net/bloodward_test?retryWrites=true&w=majority', true);
  if (dbName === 'bloodward_test') {
    console.log('[PASS] Guard allowed test database: bloodward_test');
  } else {
    console.error('[FAIL] Unexpected db name returned:', dbName);
    process.exit(1);
  }
} catch (err) {
  console.error('[FAIL] Guard rejected valid test database:', err.message);
  process.exit(1);
}

console.log('\nALL SAFETY GUARD TESTS PASSED SUCCESSFULLY.');
