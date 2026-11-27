import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

export const LICENSE_CATEGORIES = [
  {
    id: '05c99661-a9b2-48ce-b7f3-adff0d59e989',
    name: 'Municipal Corporation licence',
    tamilName: 'மாநகராட்சி உரிமம்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:57:47.663Z'),
    updatedAt: new Date('2025-12-13T05:57:47.663Z'),
  },
  {
    id: '3cda2fd0-397c-486e-9edb-b3fc13f7dad7',
    name: 'Trade Licence',
    tamilName: 'வர்த்தக உரிமம்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:56:18.372Z'),
    updatedAt: new Date('2025-12-13T05:56:18.372Z'),
  },
  {
    id: '537276a2-99f3-4a6b-85a1-1b8c0d37490b',
    name: 'Driving Licence',
    tamilName: 'ஓட்டுனர் உரிமம்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:52:34.504Z'),
    updatedAt: new Date('2025-12-13T05:52:34.504Z'),
  },
  {
    id: '76755093-c59c-4805-bb6c-1ee951b42a8c',
    name: 'FSSAI State Licence',
    tamilName: 'FSSAI மாநில உரிமம்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:53:37.613Z'),
    updatedAt: new Date('2025-12-13T05:53:37.613Z'),
  },
  {
    id: '795062bc-b3d8-4292-aff0-d7beb85f79ce',
    name: 'Shop & Establishment Registration',
    tamilName: 'கடை மற்றும் நிறுவனம் பதிவு',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:54:17.601Z'),
    updatedAt: new Date('2025-12-13T05:54:17.601Z'),
  },
  {
    id: '99caacd3-5ae8-46af-99a8-e243a9d52b2d',
    name: 'Association card',
    tamilName: 'சங்க அட்டை',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:59:27.163Z'),
    updatedAt: new Date('2025-12-13T05:59:27.163Z'),
  },
  {
    id: '9a8a935e-a077-48a0-adff-aa6e45c9ee8d',
    name: 'Udyam Aadhar',
    tamilName: 'உதயம் ஆதார்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:58:35.166Z'),
    updatedAt: new Date('2025-12-13T05:58:35.166Z'),
  },
  {
    id: 'adb1bea7-7a25-4db0-85f6-ab2282ef39cf',
    name: 'Street Vendor Certificate / Licence',
    tamilName: 'தெரு விற்பனையாளர் சான்றிதழ் / உரிமம்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:54:49.965Z'),
    updatedAt: new Date('2025-12-13T05:54:49.965Z'),
  },
  {
    id: 'b8412f5d-2f1b-40a0-a39f-b19a6504618a',
    name: 'Aadhaar Card',
    tamilName: 'ஆதார் அட்டை',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:56:42.226Z'),
    updatedAt: new Date('2025-12-13T05:56:42.226Z'),
  },
  {
    id: 'd1786624-b7c8-4938-be51-c720b042f3f0',
    name: 'FSSAI Basic Registration',
    tamilName: 'FSSAI அடிப்படை பதிவு',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-13T05:53:10.343Z'),
    updatedAt: new Date('2025-12-13T05:53:10.343Z'),
  },
  {
    id: 'deb8b569-b32d-49a5-b5e4-6ca0874cd367',
    name: 'Govt License',
    tamilName: 'அரசு உரிமம்',
    status: Status.ACTIVE,
    createdAt: new Date('2025-12-11T08:00:24.788Z'),
    updatedAt: new Date('2025-12-13T04:54:20.012Z'),
  },
];

async function main() {
  console.log('🌱 Seeding License Categories...');

  for (const item of LICENSE_CATEGORIES) {
    const record = await prisma.licenseCategory.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        tamilName: item.tamilName,
        status: item.status,
      },
      create: {
        id: item.id,
        name: item.name,
        tamilName: item.tamilName,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });

    console.log(
      `✓ [${record.id}] ${record.name} (${record.tamilName || 'N/A'}) - ${record.status}`,
    );
  }

  console.log('\n✅ All License Categories seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding License Categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
