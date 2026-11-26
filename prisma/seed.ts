import {
  BillingPeriod,
  PaymentMethod,
  Prisma,
  PrismaClient,
  Role,
  Status,
  VendorCategoryType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Eroways database seed...');

  const hashedPassword = await bcrypt.hash('12345678', 10);

  const seedMobiles = [
    '9000000001', // Admin
    '9000000002', // Street Food Vendor
    '9000000003', // Puncture Service Vendor
    '9000000004', // Common Shop Banner Vendor
    '9000000005', // Customer 1
    '9000000006', // Customer 2
    // Legacy seed mobiles if present:
    '7456734567',
    '0987654321',
    '1234567890',
    '1234512345',
  ];

  await prisma.$transaction(async (tx) => {
    // -------------------------------------------------------------
    // Clean up any existing seeded data to ensure idempotency
    // -------------------------------------------------------------
    console.log('Cleaning up existing seed records if any...');

    const existingSeedUsers = await tx.user.findMany({
      where: { mobile: { in: seedMobiles } },
      select: { id: true, vendor: { select: { id: true } } },
    });
    const vendorIds = existingSeedUsers.flatMap((u) =>
      u.vendor ? [u.vendor.id] : [],
    );

    if (vendorIds.length > 0) {
      await tx.vendorSubscription.deleteMany({
        where: { vendorId: { in: vendorIds } },
      });
      await tx.vendorServiceOption.deleteMany({
        where: { vendorId: { in: vendorIds } },
      });
      await tx.shopInfo.deleteMany({
        where: { vendorId: { in: vendorIds } },
      });
      await tx.vendor.deleteMany({
        where: { id: { in: vendorIds } },
      });
    }

    await tx.user.deleteMany({
      where: { mobile: { in: seedMobiles } },
    });

    await tx.subscriptionPlan.deleteMany({});

    await tx.vendorType.deleteMany({
      where: {
        name: {
          in: [
            'Street Food Vendor',
            'Common Shop Vendor',
            'Puncture Service Vendor',
            'Service Vendor',
          ],
        },
      },
    });

    // -------------------------------------------------------------
    // 1. Create Admin
    // -------------------------------------------------------------
    console.log('Creating Admin user...');
    const admin = await tx.user.create({
      data: {
        name: 'Admin',
        mobile: '9000000001',
        role: Role.ADMIN,
        email: 'admin@eroways.com',
        password: hashedPassword,
      },
    });

    // -------------------------------------------------------------
    // 2. Create Vendor Types
    // -------------------------------------------------------------
    console.log('Creating Vendor Types...');
    const streetFoodType = await tx.vendorType.create({
      data: {
        creatorId: admin.id,
        name: 'Street Food Vendor',
        type: VendorCategoryType.PRODUCT,
      },
    });

    const commonShopType = await tx.vendorType.create({
      data: {
        creatorId: admin.id,
        name: 'Common Shop Vendor',
        type: VendorCategoryType.BANNER,
      },
    });

    const punctureServiceType = await tx.vendorType.create({
      data: {
        creatorId: admin.id,
        name: 'Puncture Service Vendor',
        type: VendorCategoryType.SERVICE,
      },
    });

    // -------------------------------------------------------------
    // 3. Create Service Options (Dine-in and Takeaway for Street Food)
    // -------------------------------------------------------------
    console.log('Creating Service Options (Dinein & Takeaway)...');
    const dineinOption = await tx.serviceOption.create({
      data: {
        name: 'Dinein',
        description: 'Dine-in service available',
        vendorTypeId: streetFoodType.id,
      },
    });

    const takeawayOption = await tx.serviceOption.create({
      data: {
        name: 'Takeaway',
        description: 'Takeaway / Parcel service available',
        vendorTypeId: streetFoodType.id,
      },
    });

    // -------------------------------------------------------------
    // 4. Create Subscription Plans (Based on Live Reference Data)
    // -------------------------------------------------------------
    console.log('Creating Subscription Plans...');

    // Street Food (Product) Plans
    const sfStandardPlan = await tx.subscriptionPlan.create({
      data: {
        id: '1a3c3c54-647e-40c3-bf8c-7c3053c5ad57',
        name: 'Standard Plan',
        price: 100,
        billingPeriod: BillingPeriod.MONTHLY,
        discountPrice: 19,
        vendorTypeId: streetFoodType.id,
        gradientStart: '#12f33f',
        gradientEnd: '#b0f2b1',
        status: Status.ACTIVE,
        features: {
          banner: false,
          tracking: true,
          bannerCount: 5,
          dineOptions: ['Takeaway', 'Dinein'],
          paymentModes: ['CASH', 'JUSPAY'],
          stockEditable: true,
          qtyUpdateLimit: 20,
          customerSupport: true,
          openCloseStatus: true,
          coinsLimitations: 0,
          locationChangeLimit: 1,
          socialMediaPromotion: true,
          featuredProductAddition: false,
          productStatusChangeLimit: 20,
        },
      },
    });

    const sfPremiumPlan = await tx.subscriptionPlan.create({
      data: {
        id: '9beca7c4-7361-49ba-88a7-e2e5f3662d33',
        name: 'Premium Plan',
        price: 200,
        billingPeriod: BillingPeriod.MONTHLY,
        discountPrice: 99,
        vendorTypeId: streetFoodType.id,
        gradientStart: '#3B82F6',
        gradientEnd: '#1E40AF',
        status: Status.ACTIVE,
        features: {
          banner: false,
          tracking: true,
          bannerCount: 5,
          dineOptions: ['Takeaway', 'Dinein'],
          paymentModes: ['CASH', 'JUSPAY', 'COINS'],
          stockEditable: true,
          qtyUpdateLimit: 60,
          customerSupport: true,
          openCloseStatus: true,
          coinsLimitations: 1000,
          staffAccountLimit: 0,
          locationChangeLimit: 2,
          socialMediaPromotion: true,
          featuredProductAddition: false,
          productStatusChangeLimit: 60,
        },
      },
    });

    const sfGoldenPlan = await tx.subscriptionPlan.create({
      data: {
        id: '7b3c33f6-1d88-4c20-bbb6-54948a3fc3cd',
        name: 'Golden Plan',
        price: 300,
        billingPeriod: BillingPeriod.MONTHLY,
        discountPrice: 199,
        vendorTypeId: streetFoodType.id,
        gradientStart: '#f2ec40',
        gradientEnd: '#f4ed1a',
        status: Status.ACTIVE,
        features: {
          banner: true,
          tracking: false,
          bannerCount: 10,
          dineOptions: ['Takeaway', 'Dinein'],
          paymentModes: ['CASH', 'JUSPAY', 'COINS'],
          stockEditable: true,
          qtyUpdateLimit: 100,
          customerSupport: true,
          openCloseStatus: true,
          coinsLimitations: 2000,
          staffAccountLimit: 2,
          locationChangeLimit: 2,
          socialMediaPromotion: true,
          featuredProductAddition: true,
          productStatusChangeLimit: 100,
        },
      },
    });

    // Common Shop (Banner) Plans
    await tx.subscriptionPlan.create({
      data: {
        id: 'a7cd7b64-fc70-4637-b17d-30e596b7761a',
        name: 'Standard Plan( 2 Weeks)',
        price: 50,
        billingPeriod: BillingPeriod.WEEKLY,
        discountPrice: 19,
        vendorTypeId: commonShopType.id,
        gradientStart: '#0bc130',
        gradientEnd: '#06f42e',
        status: Status.ACTIVE,
        features: {
          banner: true,
          tracking: true,
          bannerCount: 10,
          dineOptions: [],
          paymentModes: ['CASH', 'JUSPAY'],
          stockEditable: true,
          customerSupport: true,
          openCloseStatus: true,
          locationChangeLimit: 1,
          socialMediaPromotion: true,
          featuredProductAddition: false,
        },
      },
    });

    await tx.subscriptionPlan.create({
      data: {
        id: '57c3bc9d-de8f-44db-9613-4ead3e071f46',
        name: 'Standard Plan',
        price: 100,
        billingPeriod: BillingPeriod.MONTHLY,
        discountPrice: 49,
        vendorTypeId: commonShopType.id,
        gradientStart: '#0df211',
        gradientEnd: '#cef8c9',
        status: Status.ACTIVE,
        features: {
          banner: true,
          tracking: true,
          bannerCount: 15,
          dineOptions: [],
          paymentModes: ['CASH', 'JUSPAY'],
          stockEditable: true,
          customerSupport: true,
          openCloseStatus: true,
          locationChangeLimit: 1,
          socialMediaPromotion: true,
          featuredProductAddition: false,
        },
      },
    });

    const csPremiumPlan = await tx.subscriptionPlan.create({
      data: {
        id: '30e0767a-9864-48b8-80b2-3fdbdfb4a527',
        name: 'Premium Plan',
        price: 200,
        billingPeriod: BillingPeriod.MONTHLY,
        discountPrice: 99,
        vendorTypeId: commonShopType.id,
        gradientStart: '#3B82F6',
        gradientEnd: '#1E40AF',
        status: Status.ACTIVE,
        features: {
          banner: true,
          tracking: true,
          bannerCount: 60,
          dineOptions: [],
          paymentModes: ['CASH', 'JUSPAY'],
          stockEditable: true,
          customerSupport: true,
          openCloseStatus: true,
          locationChangeLimit: 1,
          socialMediaPromotion: true,
          featuredProductAddition: true,
        },
      },
    });

    // Puncture Service (Service) Plans
    const svcStandardPlan = await tx.subscriptionPlan.create({
      data: {
        id: 'e392bc0b-248b-4fad-9bfc-1b4fb8b28e3e',
        name: 'Standard Plan',
        price: 100,
        billingPeriod: BillingPeriod.MONTHLY,
        discountPrice: 49,
        vendorTypeId: punctureServiceType.id,
        gradientStart: '#09f143',
        gradientEnd: '#56f566',
        status: Status.ACTIVE,
        features: {
          banner: false,
          tracking: true,
          bannerCount: 0,
          dineOptions: [],
          paymentModes: ['CASH', 'JUSPAY'],
          stockEditable: true,
          qtyUpdateLimit: 10,
          customerSupport: true,
          openCloseStatus: true,
          locationChangeLimit: 1,
          socialMediaPromotion: true,
          featuredProductAddition: false,
          productStatusChangeLimit: 10,
        },
      },
    });

    // Subscription Duration: 30 days active validity
    const subStartDate = new Date();
    const subEndDate = new Date();
    subEndDate.setDate(subEndDate.getDate() + 30);

    const erodeCity = await tx.shopCity.upsert({
      where: { name: 'Erode' },
      update: {},
      create: { name: 'Erode' },
    });

    // -------------------------------------------------------------
    // 5. Create Street Food Vendor + Active VendorSubscription
    // -------------------------------------------------------------
    console.log('Creating Street Food Vendor with Golden Plan Subscription...');
    const streetFoodUser: any = await tx.user.create({
      data: {
        name: 'Street Food Vendor',
        mobile: '9000000002',
        role: Role.VENDOR,
        email: 'streetfood@eroways.com',
        password: hashedPassword,
        vendor: {
          create: {
            vendorTypeId: streetFoodType.id,
            paymentMethod: [PaymentMethod.CASH, PaymentMethod.JUSPAY],
            shopInfo: {
              create: {
                name: 'Eroways Street Food Stall',
                address: '12 Gandhi Road, Near Bus Stand',
                shopCityId: erodeCity.id,
                pincode: '638001',
                latitude: 11.341,
                longitude: 77.7172,
                isShopOpen: true,
              },
            },
            vendorServiceOption: {
              createMany: {
                data: [
                  { serviceOptionId: dineinOption.id },
                  { serviceOptionId: takeawayOption.id },
                ],
              },
            },
          },
        },
      },
      include: { vendor: true },
    });

    if (streetFoodUser.vendor) {
      await tx.vendorSubscription.create({
        data: {
          vendorId: streetFoodUser.vendor.id,
          planId: sfGoldenPlan.id,
          planName: sfGoldenPlan.name,
          planFeatures: sfGoldenPlan.features as any,
          planBillingPeriod: sfGoldenPlan.billingPeriod,
          planPrice: sfGoldenPlan.price,
          planDiscountPrice: sfGoldenPlan.discountPrice,
          startDate: subStartDate,
          endDate: subEndDate,
          isActive: true,
        },
      });
    }

    // -------------------------------------------------------------
    // 6. Create Common Shop Banner Vendor + Active VendorSubscription
    // -------------------------------------------------------------
    console.log(
      'Creating Common Shop Vendor with Premium Plan Subscription...',
    );
    const commonShopUser: any = await tx.user.create({
      data: {
        name: 'Common Shop Banner Vendor',
        mobile: '9000000004',
        role: Role.VENDOR,
        email: 'commonshop@eroways.com',
        password: hashedPassword,
        vendor: {
          create: {
            vendorTypeId: commonShopType.id,
            paymentMethod: [PaymentMethod.CASH, PaymentMethod.JUSPAY],
            shopInfo: {
              create: {
                name: 'City Supermarket & Stores',
                address: '78 Main Bazaar Street',
                shopCityId: erodeCity.id,
                pincode: '638003',
                latitude: 11.345,
                longitude: 77.721,
                isShopOpen: true,
              },
            },
          },
        },
      },
      include: { vendor: true },
    });

    if (commonShopUser.vendor) {
      await tx.vendorSubscription.create({
        data: {
          vendorId: commonShopUser.vendor.id,
          planId: csPremiumPlan.id,
          planName: csPremiumPlan.name,
          planFeatures: csPremiumPlan.features
            ? (csPremiumPlan.features as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          planBillingPeriod: csPremiumPlan.billingPeriod,
          planPrice: csPremiumPlan.price,
          planDiscountPrice: csPremiumPlan.discountPrice,
          startDate: subStartDate,
          endDate: subEndDate,
          isActive: true,
        },
      });
    }

    // -------------------------------------------------------------
    // 7. Create Puncture Service Vendor + Active VendorSubscription
    // -------------------------------------------------------------
    console.log(
      'Creating Puncture Service Vendor with Standard Plan Subscription...',
    );
    const punctureServiceUser: any = await tx.user.create({
      data: {
        name: 'Puncture Service Vendor',
        mobile: '9000000003',
        role: Role.VENDOR,
        email: 'punctureservice@eroways.com',
        password: hashedPassword,
        vendor: {
          create: {
            vendorTypeId: punctureServiceType.id,
            paymentMethod: [PaymentMethod.CASH],
            shopInfo: {
              create: {
                name: 'Quick Puncture & Tyre Repair',
                address: '45 State Highway, Bypass Junction',
                shopCityId: erodeCity.id,
                pincode: '638002',
                latitude: 11.3425,
                longitude: 77.719,
                isShopOpen: true,
              },
            },
          },
        },
      },
      include: { vendor: true },
    });

    if (punctureServiceUser.vendor) {
      await tx.vendorSubscription.create({
        data: {
          vendorId: punctureServiceUser.vendor.id,
          planId: svcStandardPlan.id,
          planName: svcStandardPlan.name,
          planFeatures: svcStandardPlan.features
            ? (svcStandardPlan.features as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          planBillingPeriod: svcStandardPlan.billingPeriod,
          planPrice: svcStandardPlan.price,
          planDiscountPrice: svcStandardPlan.discountPrice,
          startDate: subStartDate,
          endDate: subEndDate,
          isActive: true,
        },
      });
    }

    // -------------------------------------------------------------
    // 8. Create Customer 1
    // -------------------------------------------------------------
    console.log('Creating Customer 1...');
    await tx.user.create({
      data: {
        name: 'Customer 1',
        mobile: '9000000005',
        role: Role.CUSTOMER,
        email: 'customer1@eroways.com',
        password: hashedPassword,
      },
    });

    // -------------------------------------------------------------
    // 9. Create Customer 2
    // -------------------------------------------------------------
    console.log('Creating Customer 2...');
    await tx.user.create({
      data: {
        name: 'Customer 2',
        mobile: '9000000006',
        role: Role.CUSTOMER,
        email: 'customer2@eroways.com',
        password: hashedPassword,
      },
    });
  });

  console.log(
    '✅ Database seeded successfully with all plans and vendor subscriptions!',
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
