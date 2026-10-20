import path from 'node:path';

// This target is deliberately restricted to the local demo. Real sites need their own page objects.
const port = Number(process.env.DEMO_PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('DEMO_PORT must be an integer between 1024 and 65535');
}
export const baseURL = `http://127.0.0.1:${port}`;
export const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');
// Public demo credentials only. Never use these defaults for a real application.
export const demoUser = { email: 'tester@example.test', password: 'DemoPassword123!' };
