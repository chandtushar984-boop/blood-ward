import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

const uriLine = lines.find(l => l.startsWith('MONGODB_URI='));
const testUriLine = lines.find(l => l.startsWith('MONGODB_TEST_URI='));

const prodUri = uriLine.substring('MONGODB_URI='.length).trim();
const testUri = testUriLine ? testUriLine.substring('MONGODB_TEST_URI='.length).trim() : null;

async function inspect(uri, label) {
  const conn = await mongoose.createConnection(uri).asPromise();
  const db = conn.db;
  const usersCount = await db.collection('users').countDocuments();
  const requestsCount = await db.collection('bloodrequests').countDocuments();
  const auditCount = await db.collection('auditlogs').countDocuments();

  console.log(`=== ${label} [DB: ${conn.name}] ===`);
  console.log(`users count: ${usersCount}`);
  console.log(`bloodrequests count: ${requestsCount}`);
  console.log(`auditlogs count: ${auditCount}`);
  await conn.close();
}

async function main() {
  await inspect(prodUri, 'PRODUCTION DATABASE');
  if (testUri) {
    await inspect(testUri, 'TEST DATABASE');
  }
}

main().catch(console.error);
