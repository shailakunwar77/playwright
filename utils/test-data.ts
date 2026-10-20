import { randomUUID } from 'node:crypto';

/** Reserved .test domain; unique across workers and retries; no real email is sent. */
export function generateEmail(prefix = 'e2e'): string {
  const safePrefix = prefix.replace(/[^a-z0-9-]/gi, '').slice(0, 20) || 'e2e';
  return `${safePrefix}-${randomUUID()}@example.test`;
}

export const directoryNames = [
  'Aisha Khan', 'Ben Carter', 'Carla Diaz', 'David Evans', 'Emma Foster', 'Farah Green',
  'Grace Hall', 'Henry Irwin', 'Isla Jones', 'Jack King', 'Keira Lane', 'Liam Moore',
];
