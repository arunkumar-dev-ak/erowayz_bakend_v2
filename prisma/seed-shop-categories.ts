import { PrismaClient, Status, VendorCategoryType } from '@prisma/client';

const prisma = new PrismaClient();

export const SHOP_CATEGORIES = [
  {
    id: '2463f8e8-7bb0-4b2f-ab45-b2abb485065c',
    name: 'Cart & Shop',
    tamilName: 'தள்ளுவண்டி & கடை',
    vendorTypeId: 'b18ac6ad-53ee-47f3-b0a9-2e65b6ee178f',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-19T16:58:57.670Z'),
    updatedAt: new Date('2025-12-19T16:58:57.670Z'),
  },
  {
    id: '7b133393-b755-4a6b-acea-6d9d6e2722e1',
    name: 'Shop',
    tamilName: 'கடை',
    vendorTypeId: 'b18ac6ad-53ee-47f3-b0a9-2e65b6ee178f',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-11T07:42:14.427Z'),
    updatedAt: new Date('2025-12-11T07:42:14.427Z'),
  },
  {
    id: 'f3086db7-af5d-41e2-8328-7e3e84ce752e',
    name: 'Cart',
    tamilName: 'தள்ளு வண்டி',
    vendorTypeId: 'b18ac6ad-53ee-47f3-b0a9-2e65b6ee178f',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-11T07:42:43.337Z'),
    updatedAt: new Date('2025-12-11T07:42:43.337Z'),
  },
];

async function main() {
  console.log('🌱 Seeding Shop Types / Shop Categories...');

  // 1. Resolve VendorType to link to (checks ID first, then 'Street Food Vendor' by name)
  let vendorType = await prisma.vendorType.findUnique({
    where: { id: 'b18ac6ad-53ee-47f3-b0a9-2e65b6ee178f' },
  });

  if (!vendorType) {
    vendorType = await prisma.vendorType.findFirst({
      where: {
        OR: [
          { name: 'Street Food Vendor' },
          { name: { contains: 'Street Food', mode: 'insensitive' } },
        ],
      },
    });
  }

  if (!vendorType) {
    vendorType = await prisma.vendorType.findFirst();
  }

  if (!vendorType) {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!adminUser) {
      throw new Error(
        'Cannot seed Shop Categories: No VendorType and no Admin user found.',
      );
    }
    vendorType = await prisma.vendorType.create({
      data: {
        id: 'b18ac6ad-53ee-47f3-b0a9-2e65b6ee178f',
        name: 'Street Food Vendor',
        tamilName: 'தெரு உணவு விற்பனையாளர்',
        type: VendorCategoryType.PRODUCT,
        creatorId: adminUser.id,
        status: Status.ACTIVE,
      },
    });
  }

  const targetVendorTypeId = vendorType.id;
  console.log(
    `✓ Linking Shop Categories to VendorType: "${vendorType.name}" (${targetVendorTypeId})`,
  );

  // 2. Seed each ShopCategory idempotently
  for (const item of SHOP_CATEGORIES) {
    const existingByName = await prisma.shopCategory.findUnique({
      where: {
        name_vendorTypeId: {
          name: item.name,
          vendorTypeId: targetVendorTypeId,
        },
      },
    });

    let record;
    if (existingByName) {
      record = await prisma.shopCategory.update({
        where: { id: existingByName.id },
        data: {
          tamilName: item.tamilName,
          status: item.status,
        },
      });
    } else {
      record = await prisma.shopCategory.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          tamilName: item.tamilName,
          vendorTypeId: targetVendorTypeId,
          status: item.status,
        },
        create: {
          id: item.id,
          name: item.name,
          tamilName: item.tamilName,
          vendorTypeId: targetVendorTypeId,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    }

    console.log(
      `✓ [${record.id}] ${record.name} (${record.tamilName || 'N/A'}) - VendorType: ${record.vendorTypeId}`,
    );
  }

  console.log('\n✅ All Shop Categories seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Shop Categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
