import { detectPhishing } from './src/lib/api';

// Polyfill import.meta.env for Node testing
(global as any).import = { meta: { env: { DEV: true } } };

async function runTest() {
  const result = await detectPhishing("This is an SMS text without any URLs or IPs. Urgent action required! Verify your account password.");
  console.log(JSON.stringify(result, null, 2));
}

runTest();
