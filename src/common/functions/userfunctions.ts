// import * as crypto from 'crypto';
// import baseX from 'base-x';
import { PrismaService } from 'src/prisma/prisma.service';
import { VendorCategoryType } from '@prisma/client';

// const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
// const base62 = baseX(BASE62);

// export function generateReferralCode(uuid: string): string {
//   const hash = crypto.createHash('sha256').update(uuid).digest(); // 32 bytes
//   const shortHash = hash.subarray(0, 5); // 5 bytes = 40 bits
//   const randomBytes = crypto.randomBytes(2); // 2 bytes = 16 bits
//   const finalBuffer = Buffer.concat([shortHash, randomBytes]); // 7 bytes = 56 bits
//   const referralCode = base62.encode(finalBuffer).toUpperCase(); // ~9 chars
//   return referralCode;
// }

// export async function getReferralForRegistration(
//   prisma: PrismaService,
//   uuid: string,
//   vendorCategoryType: VendorCategoryType,
// ) {
//   let referralCode: string;
//   let isUnique = false;

//   const vendorCount = await prisma.vendor.count({
//     where: {
//       vendorType: {
//         type: vendorCategoryType,
//       },
//     },
//   });

//   do {
//     referralCode = generateReferralCode(uuid); // as above
//     const existing = await prisma.user.findUnique({ where: { referralCode } });
//     if (!existing) isUnique = true;
//   } while (!isUnique);

//   return referralCode;
// }

export async function getReferralForRegistration(
  prisma: PrismaService,
  vendorCategoryType: VendorCategoryType,
): Promise<string> {
  // Define prefixes based on category
  const prefixMap: Record<VendorCategoryType, string> = {
    PRODUCT: 'EROSFV',
    BANNER: 'EROCMO',
    SERVICE: 'EROVSV',
  };

  const prefix = prefixMap[vendorCategoryType];

  // Count vendors of this category to determine next number
  const vendorCount = await prisma.vendor.count({
    where: {
      vendorType: {
        type: vendorCategoryType,
      },
    },
  });

  // Increment count for new referral
  const nextNumber = vendorCount + 1;

  // Format number as 3 digits minimum (e.g., 001, 012, 123, 1001)
  const formattedNumber = nextNumber.toString().padStart(3, '0');

  // Final referral code
  const referralCode = `${prefix}${formattedNumber}`;

  return referralCode;
}
