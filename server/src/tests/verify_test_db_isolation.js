import { getTestMongoUri, enforceTestEnvironment, connectTestDB } from './testDb.js';
import { getDatabaseNameFromUri } from '../config/db.js';

console.log('Testing testDb.js...');
const uri = getTestMongoUri();
const dbName = getDatabaseNameFromUri(uri);
console.log('Test DB Name:', dbName);

if (dbName === 'bloodward_test') {
  console.log('[PASS] Test DB is isolated to bloodward_test');
} else {
  console.error('[FAIL] Unexpected DB name:', dbName);
  process.exit(1);
}
