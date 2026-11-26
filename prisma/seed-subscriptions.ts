import {
  BillingPeriod,
  PrismaClient,
  Status,
  SubscriptionOrigin,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Subscription Plans & Vendor Subscriptions only...');

  // 1. Fetch Existing Vendor Types
  const streetFoodType = await prisma.vendorType.findFirst({
    where: { name: 'Street Food Vendor' },
  });
  const commonShopType = await prisma.vendorType.findFirst({
    where: { name: 'Common Shop Vendor' },
  });
  const punctureServiceType = await prisma.vendorType.findFirst({
    where: { name: 'Puncture Service Vendor' },
  });

  if (!streetFoodType || !commonShopType || !punctureServiceType) {
    console.error(
      '❌ Could not find all 3 vendor types (Street Food Vendor, Common Shop Vendor, Puncture Service Vendor). Please make sure they exist in the DB.',
    );
    process.exit(1);
  }

  console.log('Found VendorTypes:');
  console.log(`- Street Food: ${streetFoodType.id}`);
  console.log(`- Common Shop: ${commonShopType.id}`);
  console.log(`- Puncture Service: ${punctureServiceType.id}`);

  // 2. Upsert Subscription Plans
  console.log('Upserting Subscription Plans...');

  // Street Food (Product) Plans
  const sfStandardPlan = await prisma.subscriptionPlan.upsert({
    where: { id: '1a3c3c54-647e-40c3-bf8c-7c3053c5ad57' },
    update: {
      name: 'Standard Plan',
      price: 100,
      billingPeriod: BillingPeriod.MONTHLY,
      discountPrice: 19,
      vendorTypeId: streetFoodType.id,
      gradientStart: '#12f33f',
      gradientEnd: '#b0f2b1',
      status: Status.ACTIVE,
    },
    create: {
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

  const sfPremiumPlan = await prisma.subscriptionPlan.upsert({
    where: { id: '9beca7c4-7361-49ba-88a7-e2e5f3662d33' },
    update: {
      name: 'Premium Plan',
      price: 200,
      billingPeriod: BillingPeriod.MONTHLY,
      discountPrice: 99,
      vendorTypeId: streetFoodType.id,
      gradientStart: '#3B82F6',
      gradientEnd: '#1E40AF',
      status: Status.ACTIVE,
    },
    create: {
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

  const sfGoldenPlan = await prisma.subscriptionPlan.upsert({
    where: { id: '7b3c33f6-1d88-4c20-bbb6-54948a3fc3cd' },
    update: {
      name: 'Golden Plan',
      price: 300,
      billingPeriod: BillingPeriod.MONTHLY,
      discountPrice: 199,
      vendorTypeId: streetFoodType.id,
      gradientStart: '#f2ec40',
      gradientEnd: '#f4ed1a',
      status: Status.ACTIVE,
    },
    create: {
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
  await prisma.subscriptionPlan.upsert({
    where: { id: 'a7cd7b64-fc70-4637-b17d-30e596b7761a' },
    update: {
      name: 'Standard Plan( 2 Weeks)',
      price: 50,
      billingPeriod: BillingPeriod.WEEKLY,
      discountPrice: 19,
      vendorTypeId: commonShopType.id,
      gradientStart: '#0bc130',
      gradientEnd: '#06f42e',
      status: Status.ACTIVE,
    },
    create: {
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

  await prisma.subscriptionPlan.upsert({
    where: { id: '57c3bc9d-de8f-44db-9613-4ead3e071f46' },
    update: {
      name: 'Standard Plan',
      price: 100,
      billingPeriod: BillingPeriod.MONTHLY,
      discountPrice: 49,
      vendorTypeId: commonShopType.id,
      gradientStart: '#0df211',
      gradientEnd: '#cef8c9',
      status: Status.ACTIVE,
    },
    create: {
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

  const csPremiumPlan = await prisma.subscriptionPlan.upsert({
    where: { id: '30e0767a-9864-48b8-80b2-3fdbdfb4a527' },
    update: {
      name: 'Premium Plan',
      price: 200,
      billingPeriod: BillingPeriod.MONTHLY,
      discountPrice: 99,
      vendorTypeId: commonShopType.id,
      gradientStart: '#3B82F6',
      gradientEnd: '#1E40AF',
      status: Status.ACTIVE,
    },
    create: {
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
  const svcStandardPlan = await prisma.subscriptionPlan.upsert({
    where: { id: 'e392bc0b-248b-4fad-9bfc-1b4fb8b28e3e' },
    update: {
      name: 'Standard Plan',
      price: 100,
      billingPeriod: BillingPeriod.MONTHLY,
      discountPrice: 49,
      vendorTypeId: punctureServiceType.id,
      gradientStart: '#09f143',
      gradientEnd: '#56f566',
      status: Status.ACTIVE,
    },
    create: {
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

  console.log('✅ Subscription Plans upserted successfully.');

  // 3. Attach Active Subscriptions to Existing Seeded Vendors
  console.log('Assigning active subscriptions to existing seeded vendors...');
  const subStartDate = new Date();
  const subEndDate = new Date();
  subEndDate.setDate(subEndDate.getDate() + 30);

  // 3a. Street Food Vendor (9000000002)
  const streetFoodUser = await prisma.user.findUnique({
    where: { mobile: '9000000002' },
    include: { vendor: true },
  });
  if (streetFoodUser?.vendor) {
    // Deactivate previous subscriptions if any, and create new active one
    await prisma.vendorSubscription.updateMany({
      where: { vendorId: streetFoodUser.vendor.id, isActive: true },
      data: { isActive: false },
    });
    await prisma.vendorSubscription.create({
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
        origin: SubscriptionOrigin.DIRECT_PURCHASE,
      },
    });
    console.log(
      '✅ Street Food Vendor (9000000002) subscribed to Golden Plan.',
    );
  } else {
    console.warn('⚠️ Street Food Vendor user (9000000002) not found in DB.');
  }

  // 3b. Common Shop Vendor (9000000004)
  const commonShopUser = await prisma.user.findUnique({
    where: { mobile: '9000000004' },
    include: { vendor: true },
  });
  if (commonShopUser?.vendor) {
    await prisma.vendorSubscription.updateMany({
      where: { vendorId: commonShopUser.vendor.id, isActive: true },
      data: { isActive: false },
    });
    await prisma.vendorSubscription.create({
      data: {
        vendorId: commonShopUser.vendor.id,
        planId: csPremiumPlan.id,
        planName: csPremiumPlan.name,
        planFeatures: csPremiumPlan.features as any,
        planBillingPeriod: csPremiumPlan.billingPeriod,
        planPrice: csPremiumPlan.price,
        planDiscountPrice: csPremiumPlan.discountPrice,
        startDate: subStartDate,
        endDate: subEndDate,
        isActive: true,
        origin: SubscriptionOrigin.DIRECT_PURCHASE,
      },
    });
    console.log(
      '✅ Common Shop Vendor (9000000004) subscribed to Premium Plan.',
    );
  } else {
    console.warn('⚠️ Common Shop Vendor user (9000000004) not found in DB.');
  }

  // 3c. Puncture Service Vendor (9000000003)
  const punctureServiceUser = await prisma.user.findUnique({
    where: { mobile: '9000000003' },
    include: { vendor: true },
  });
  if (punctureServiceUser?.vendor) {
    await prisma.vendorSubscription.updateMany({
      where: { vendorId: punctureServiceUser.vendor.id, isActive: true },
      data: { isActive: false },
    });
    await prisma.vendorSubscription.create({
      data: {
        vendorId: punctureServiceUser.vendor.id,
        planId: svcStandardPlan.id,
        planName: svcStandardPlan.name,
        planFeatures: svcStandardPlan.features as any,
        planBillingPeriod: svcStandardPlan.billingPeriod,
        planPrice: svcStandardPlan.price,
        planDiscountPrice: svcStandardPlan.discountPrice,
        startDate: subStartDate,
        endDate: subEndDate,
        isActive: true,
        origin: SubscriptionOrigin.DIRECT_PURCHASE,
      },
    });
    console.log(
      '✅ Puncture Service Vendor (9000000003) subscribed to Standard Plan.',
    );
  } else {
    console.warn(
      '⚠️ Puncture Service Vendor user (9000000003) not found in DB.',
    );
  }

  console.log('🎉 Subscription seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding subscriptions:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
