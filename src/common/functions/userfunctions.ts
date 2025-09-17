import * as crypto from 'crypto';
import baseX from 'base-x';
import { PrismaService } from 'src/prisma/prisma.service';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);

export function generateReferralCode(uuid: string): string {
  const hash = crypto.createHash('sha256').update(uuid).digest(); // 32 bytes
  const shortHash = hash.subarray(0, 5); // 5 bytes = 40 bits
  const randomBytes = crypto.randomBytes(2); // 2 bytes = 16 bits
  const finalBuffer = Buffer.concat([shortHash, randomBytes]); // 7 bytes = 56 bits
  const referralCode = base62.encode(finalBuffer).toUpperCase(); // ~9 chars
  return referralCode;
}

export async function getReferralForRegistration(
  prisma: PrismaService,
  uuid: string,
) {
  let referralCode: string;
  let isUnique = false;

  do {
    referralCode = generateReferralCode(uuid); // as above
    const existing = await prisma.user.findUnique({ where: { referralCode } });
    if (!existing) isUnique = true;
  } while (!isUnique);

  return referralCode;
}
