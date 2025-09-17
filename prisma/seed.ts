import {
  PaymentMethod,
  PrismaClient,
  Role,
  ServiceOption,
  VendorCategoryType,
  VendorType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    // Create admin
    const admin = await tx.user.create({
      data: {
        name: 'Admin',
        mobile: '7456734567',
        role: Role.ADMIN,
        email: 'eroways@gmail.com',
        password: await bcrypt.hash('12345678', 10),
      },
    });

    // Create vendor types
    const vendorTypeArray = [
      {
        name: 'Street Food Vendor',
        type: VendorCategoryType.PRODUCT,
      },
      {
        name: 'Common Shop Vendor',
        type: VendorCategoryType.BANNER,
      },
      {
        name: 'Service Vendor',
        type: VendorCategoryType.SERVICE,
      },
    ];

    const VendorTypes: VendorType[] = [];
    for (const vendor of vendorTypeArray) {
      const createdVendorType = await tx.vendorType.create({
        data: {
          creatorId: admin.id,
          name: vendor.name,
          type: vendor.type,
        },
      });
      VendorTypes.push(createdVendorType);
    }

    // Create service options
    const serviceOptionTypeArray = [
      {
        name: 'Dinein',
        vendorTypeId: VendorTypes[0].id,
      },
      {
        name: 'Takeaway',
        vendorTypeId: VendorTypes[0].id,
      },
    ];

    const ServiceOption: ServiceOption[] = [];
    for (let i = 0; i < serviceOptionTypeArray.length; i++) {
      const service = await tx.serviceOption.create({
        data: {
          name: serviceOptionTypeArray[i].name,
          vendorTypeId: serviceOptionTypeArray[i].vendorTypeId,
          description: serviceOptionTypeArray[i].name,
        },
      });
      ServiceOption.push(service);
    }

    // Create Service Vendor (no service options)
    await tx.user.create({
      data: {
        mobile: '0987654321',
        name: 'Service Vendor',
        role: Role.VENDOR,
        email: 'serviceVendor@gmail.com',
        vendor: {
          create: {
            vendorTypeId: VendorTypes[2].id, // SERVICE
            paymentMethod: [PaymentMethod.CASH],
            shopInfo: {
              create: {
                name: 'Service Vendor Shop',
                address: 'Service vendor address',
                city: 'Service vendor City',
                pincode: '641672',
                latitude: 10.123456,
                longitude: 77.654321,
              },
            },
          },
        },
      },
    });

    // Create Product Vendor (with ServiceOptions)
    await tx.user.create({
      data: {
        mobile: '1234567890',
        name: 'Product Vendor',
        role: Role.VENDOR,
        email: 'productVendor@gmail.com',
        vendor: {
          create: {
            vendorTypeId: VendorTypes[0].id, // PRODUCT
            paymentMethod: [PaymentMethod.CASH],
            shopInfo: {
              create: {
                name: 'ProductVendor Shop',
                address: 'Product vendor address',
                city: 'Product vendor City',
                pincode: '641671',
                latitude: 40.712776,
                longitude: -74.005974,
              },
            },
            vendorServiceOption: {
              createMany: {
                data: ServiceOption.map((service) => ({
                  serviceOptionId: service.id,
                })),
              },
            },
          },
        },
      },
    });

    // Create customer
    await tx.user.create({
      data: {
        name: 'Customer',
        mobile: '1234512345',
        role: Role.CUSTOMER,
        email: 'user@gmail.com',
        password: await bcrypt.hash('12345678', 10),
      },
    });
  });
}

main()
  .then(() => console.log('Seeded successfully'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
