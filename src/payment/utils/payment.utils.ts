import { randomBytes } from 'crypto';

export function createUniqueOrderId(): string {
  const randomPart = randomBytes(8)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 12);
  const timePart = Date.now().toString(36); // Base36 = shorter representation
  return ('ORD' + randomPart + timePart).slice(0, 20); // Ensure total length < 21
}
