import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

export const PRODUCT_UNITS = [
  {
    name: 'UNIT',
    tamilName: 'அலகு',
  },
  {
    name: 'PIECE',
    tamilName: 'துண்டு',
  },
  {
    name: 'PLATE',
    tamilName: 'தட்டு',
  },
  {
    name: 'KG',
    tamilName: 'கிலோகிராம்',
  },
  {
    name: 'GRAM',
    tamilName: 'கிராம்',
  },
  {
    name: 'LITRE',
    tamilName: 'லிட்டர்',
  },
  {
    name: 'MILLILITRE',
    tamilName: 'மில்லிலிட்டர்',
  },
  {
    name: 'BOX',
    tamilName: 'பெட்டி',
  },
  {
    name: 'SET',
    tamilName: 'தொகுப்பு',
  },
  {
    name: 'PACKET',
    tamilName: 'பாக்கெட்',
  },
  {
    name: 'SERVE',
    tamilName: 'பரிமாறு',
  },
  {
    name: 'PORTION',
    tamilName: 'பகுதி',
  },
];

async function main() {
  console.log('🌱 Seeding Product Units...');

  for (const unit of PRODUCT_UNITS) {
    const record = await prisma.productUnit.upsert({
      where: { name: unit.name },
      update: {
        tamilName: unit.tamilName,
        status: Status.ACTIVE,
      },
      create: {
        name: unit.name,
        tamilName: unit.tamilName,
        status: Status.ACTIVE,
      },
    });
    console.log(`- ${record.name.padEnd(12)}: ${record.id} (${record.tamilName})`);
  }

  console.log('\n✅ All Product Units seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Product Units:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
