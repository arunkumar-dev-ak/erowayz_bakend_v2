import { PrismaClient, Role, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Expired License without documents for Street Food Vendor (002)...');

  // 1. Find the Street Food Vendor (mobile 9000000002 or ending with 002)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile: '9000000002' },
        { mobile: { endsWith: '002' } },
        { name: { contains: 'Street Food', mode: 'insensitive' } },
      ],
      role: Role.VENDOR,
    },
    include: {
      vendor: {
        include: {
          shopInfo: true,
        },
      },
    },
  });

  if (!user || !user.vendor) {
    console.error('❌ Street Food Vendor (mobile ending with 002) not found in DB.');
    console.log('Please ensure the vendor exists before running this seed.');
    return;
  }

  console.log(`✅ Found Vendor User: "${user.name}" (ID: ${user.id}, Mobile: ${user.mobile})`);

  let shopInfo = user.vendor.shopInfo;

  // 2. Ensure ShopInfo exists
  if (!shopInfo) {
    console.log('ℹ ShopInfo not found for vendor. Creating a default ShopInfo...');
    // Find or create city
    let city = await prisma.shopCity.findFirst({
      where: { name: { contains: 'Erode', mode: 'insensitive' } },
    });
    if (!city) {
      city = await prisma.shopCity.findFirst();
    }
    if (!city) {
      city = await prisma.shopCity.create({
        data: {
          name: 'Erode',
          tamilName: 'ஈரோடு',
          status: Status.ACTIVE,
        },
      });
    }

    shopInfo = await prisma.shopInfo.create({
      data: {
        vendorId: user.vendor.id,
        name: 'Eroways Street Food Stall',
        address: '12 Gandhi Road, Near Bus Stand',
        shopCityId: city.id,
        pincode: '638001',
        latitude: 11.341,
        longitude: 77.7172,
        isShopOpen: true,
      },
    });
    console.log(`✅ Created ShopInfo (ID: ${shopInfo.id})`);
  } else {
    console.log(`✅ Found ShopInfo: "${shopInfo.name}" (ID: ${shopInfo.id})`);
  }

  // 3. Find or Create a License Category (e.g. FSSAI State Licence)
  let licenseCategory = await prisma.licenseCategory.findFirst({
    where: {
      OR: [
        { name: { contains: 'FSSAI', mode: 'insensitive' } },
        { name: { contains: 'Food', mode: 'insensitive' } },
      ],
    },
  });

  if (!licenseCategory) {
    licenseCategory = await prisma.licenseCategory.findFirst();
  }

  if (!licenseCategory) {
    console.log('ℹ No LicenseCategory found. Creating default FSSAI category...');
    licenseCategory = await prisma.licenseCategory.create({
      data: {
        name: 'FSSAI State Licence',
        tamilName: 'FSSAI மாநில உரிமம்',
        status: Status.ACTIVE,
      },
    });
  }

  console.log(`✅ Using LicenseCategory: "${licenseCategory.name}" (ID: ${licenseCategory.id})`);

  // 4. Seed Expired License without documents (image = null, relativeUrl = null)
  // Expiry date set to past: January 15, 2024
  const expiredDate = new Date('2024-01-15T00:00:00.000Z');
  const licenseNo = `FSSAI-EXPIRED-${user.mobile || '9000000002'}`;

  const license = await prisma.license.upsert({
    where: { shopInfoId: shopInfo.id },
    create: {
      licenseNo,
      expiryDate: expiredDate,
      image: null,           // No document image
      relativeUrl: null,     // No document file path
      licenseCategoryId: licenseCategory.id,
      shopInfoId: shopInfo.id,
      isLicenseApproved: false,
      isKycConsentAccepted: true,
      kycConsentAcceptedAt: new Date('2023-01-15T00:00:00.000Z'),
    },
    update: {
      licenseNo,
      expiryDate: expiredDate,
      image: null,           // Clear document image
      relativeUrl: null,     // Clear document file path
      licenseCategoryId: licenseCategory.id,
      isLicenseApproved: false,
      isKycConsentAccepted: true,
    },
  });

  console.log('\n🎉 Successfully seeded expired license:');
  console.table({
    licenseId: license.id,
    licenseNo: license.licenseNo,
    shopInfoId: license.shopInfoId,
    vendorMobile: user.mobile,
    expiryDate: license.expiryDate.toISOString(),
    isExpired: license.expiryDate < new Date(),
    hasDocs: license.image !== null || license.relativeUrl !== null,
    isLicenseApproved: license.isLicenseApproved,
    isKycConsentAccepted: license.isKycConsentAccepted,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding expired license:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
