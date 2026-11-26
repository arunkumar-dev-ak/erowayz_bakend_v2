import { AccountStatus, Prisma, ProductStatus, Status } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

export interface ActiveTransactionCheckResult {
  hasActiveTransactions: boolean;
  reasons: string[];
}

export interface PreservableActivityCheckResult {
  hasActivity: boolean;
  reasons: string[];
}

export async function checkActiveTransactionsForDeletion(
  prisma: PrismaClientLike,
  {
    userId,
    vendorId,
  }: {
    userId: string;
    vendorId?: string;
  },
): Promise<ActiveTransactionCheckResult> {
  const now = new Date();
  const reasons: string[] = [];

  const [
    activeCustomerOrder,
    activeCustomerBooking,
    wallet,
    pendingPayment,
    activeVendorOrder,
    activeVendorBooking,
  ] = await Promise.all([
    prisma.order.findFirst({
      where: {
        userId,
        orderStatus: { notIn: ['DELIVERED', 'CANCELLED'] },
      },
      select: { id: true },
    }),
    prisma.booking.findFirst({
      where: {
        userId,
        bookingStatus: { notIn: ['DELIVERED', 'CANCELLED'] },
      },
      select: { id: true },
    }),
    prisma.wallet.findUnique({
      where: { userId },
      select: { lockedBalance: true },
    }),
    prisma.payment.findFirst({
      where: {
        userId,
        status: 'PENDING',
        paymentPageExpiry: { gt: now },
      },
      select: { id: true },
    }),
    vendorId
      ? prisma.order.findFirst({
          where: {
            orderStatus: { notIn: ['DELIVERED', 'CANCELLED'] },
            orderItems: {
              some: {
                item: { vendorId },
              },
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
    vendorId
      ? prisma.booking.findFirst({
          where: {
            bookingStatus: { notIn: ['DELIVERED', 'CANCELLED'] },
            OR: [
              { bannerBooking: { vendorId } },
              {
                serviceBooking: {
                  some: {
                    vendorSubService: {
                      service: { vendorId },
                    },
                  },
                },
              },
            ],
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (activeCustomerOrder) {
    reasons.push('active customer orders');
  }
  if (activeCustomerBooking) {
    reasons.push('active customer bookings');
  }
  if (activeVendorOrder) {
    reasons.push('active incoming vendor orders');
  }
  if (activeVendorBooking) {
    reasons.push('active incoming vendor bookings');
  }
  if (wallet && wallet.lockedBalance > 0) {
    reasons.push('locked wallet coins from pending orders');
  }
  if (pendingPayment) {
    reasons.push('pending online payment session');
  }

  return {
    hasActiveTransactions: reasons.length > 0,
    reasons,
  };
}

export async function checkPreservableAccountActivity(
  tx: Prisma.TransactionClient,
  {
    userId,
    vendorId,
    referralCode,
  }: {
    userId: string;
    vendorId?: string;
    referralCode?: string | null;
  },
): Promise<PreservableActivityCheckResult> {
  const reasons: string[] = [];

  const wallet = await tx.wallet.findUnique({
    where: { userId },
    select: { id: true, balance: true, lockedBalance: true },
  });

  const retiredCodes = await tx.retiredReferralCode.findMany({
    where: { userId },
    select: { code: true },
  });

  const referralMatches: string[] = [userId];
  if (referralCode) {
    referralMatches.push(referralCode);
  }
  for (const retired of retiredCodes) {
    if (!referralMatches.includes(retired.code)) {
      referralMatches.push(retired.code);
    }
  }

  const [
    userOrdersCount,
    userBookingsCount,
    paymentCount,
    walletTxnCount,
    reviewCount,
    vendorRatingCount,
    bloodRequestCount,
    customerReportCount,
    preDefinedBannerCount,
    vendorTypeCreatedCount,
    referralUsageCount,
    vendorOrderItemCount,
    vendorServiceOptOrderCount,
    vendorServiceBookingCount,
    vendorBannerBookingCount,
    vendorSubscriptionCount,
    adminCredit,
  ] = await Promise.all([
    tx.order.count({
      where: {
        OR: [{ userId }, { declinedBy: userId }],
      },
    }),
    tx.booking.count({
      where: {
        OR: [{ userId }, { declinedBy: userId }],
      },
    }),
    tx.payment.count({ where: { userId } }),
    wallet
      ? tx.walletTransaction.count({
          where: {
            OR: [
              { senderWalletId: wallet.id },
              { receiverWalletId: wallet.id },
            ],
          },
        })
      : Promise.resolve(0),
    tx.review.count({
      where: {
        OR: [{ userId }, ...(vendorId ? [{ vendorId }] : [])],
      },
    }),
    tx.vendorRating.count({
      where: {
        OR: [{ userId }, ...(vendorId ? [{ vendorId }] : [])],
      },
    }),
    tx.bloodRequest.count({
      where: {
        OR: [{ userId }, { donorId: userId }],
      },
    }),
    tx.customerReport.count({ where: { userId } }),
    tx.preDefinedBanner.count({ where: { userId } }),
    tx.vendorType.count({ where: { creatorId: userId } }),
    vendorId
      ? tx.vendorSubscription.count({
          where: {
            referredVendorId: vendorId,
          },
        })
      : Promise.resolve(0),
    vendorId
      ? tx.orderItem.count({ where: { item: { vendorId } } })
      : Promise.resolve(0),
    vendorId
      ? tx.orderItemVendorServiceOption.count({
          where: { vendorServiceOption: { vendorId } },
        })
      : Promise.resolve(0),
    vendorId
      ? tx.serviceBooking.count({
          where: { vendorSubService: { service: { vendorId } } },
        })
      : Promise.resolve(0),
    vendorId
      ? tx.bannerBooking.count({ where: { vendorId } })
      : Promise.resolve(0),
    vendorId
      ? tx.vendorSubscription.count({ where: { vendorId } })
      : Promise.resolve(0),
    vendorId
      ? tx.adminVendorCredit.findUnique({ where: { vendorId } })
      : Promise.resolve(null),
  ]);

  if (
    userOrdersCount > 0 ||
    vendorOrderItemCount > 0 ||
    vendorServiceOptOrderCount > 0
  ) {
    reasons.push('orders');
  }
  if (
    userBookingsCount > 0 ||
    vendorServiceBookingCount > 0 ||
    vendorBannerBookingCount > 0
  ) {
    reasons.push('bookings');
  }
  if (paymentCount > 0) {
    reasons.push('payments');
  }
  if (
    walletTxnCount > 0 ||
    (wallet && (wallet.balance > 0 || wallet.lockedBalance > 0)) ||
    (adminCredit &&
      (adminCredit.totalGiven > 0 || adminCredit.totalRefunded > 0))
  ) {
    reasons.push('wallet transactions or credit balance');
  }
  if (vendorSubscriptionCount > 0) {
    reasons.push('vendor subscriptions');
  }
  if (referralUsageCount > 0) {
    reasons.push('referral reward records');
  }
  if (reviewCount > 0 || vendorRatingCount > 0) {
    reasons.push('reviews or ratings');
  }
  if (bloodRequestCount > 0) {
    reasons.push('blood requests');
  }
  if (customerReportCount > 0) {
    reasons.push('customer reports');
  }
  if (preDefinedBannerCount > 0 || vendorTypeCreatedCount > 0) {
    reasons.push('admin configuration entities');
  }

  return {
    hasActivity: reasons.length > 0,
    reasons,
  };
}

export async function collectUserPiiFilePaths(
  tx: Prisma.TransactionClient,
  {
    userId,
    vendorId,
    includeCatalogMedia,
  }: {
    userId: string;
    vendorId?: string;
    includeCatalogMedia: boolean;
  },
): Promise<string[]> {
  const paths = new Set<string>();

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { relativeUrl: true },
  });
  if (user?.relativeUrl) {
    paths.add(user.relativeUrl);
  }

  const bloodRequests = await tx.bloodRequest.findMany({
    where: { userId },
    select: { documentRelativeUrl: true },
  });
  for (const br of bloodRequests) {
    if (br.documentRelativeUrl) {
      paths.add(br.documentRelativeUrl);
    }
  }

  if (vendorId) {
    const shopInfo = await tx.shopInfo.findUnique({
      where: { vendorId },
      include: { license: true },
    });
    if (shopInfo?.relativeUrl) {
      paths.add(shopInfo.relativeUrl);
    }
    if (shopInfo?.license?.relativeUrl) {
      paths.add(shopInfo.license.relativeUrl);
    }

    if (includeCatalogMedia) {
      const [
        itemImages,
        serviceImages,
        banners,
        bannerItemImages,
        bannerVendorImages,
      ] = await Promise.all([
        tx.itemImage.findMany({
          where: { item: { vendorId } },
          select: { relativeUrl: true },
        }),
        tx.serviceImage.findMany({
          where: { service: { vendorId } },
          select: { relativeUrl: true },
        }),
        tx.banner.findMany({
          where: { vendorId },
          select: { bgImageRelativeUrl: true, fgImageRelativeUrl: true },
        }),
        tx.bannerItemImages.findMany({
          where: { banner: { vendorId } },
          select: { relativeUrl: true },
        }),
        tx.bannerVendorItemsImage.findMany({
          where: { bannerVendorItem: { vendorId } },
          select: { relativeUrl: true },
        }),
      ]);

      for (const img of itemImages) {
        if (img.relativeUrl) paths.add(img.relativeUrl);
      }
      for (const img of serviceImages) {
        if (img.relativeUrl) paths.add(img.relativeUrl);
      }
      for (const banner of banners) {
        if (banner.bgImageRelativeUrl) paths.add(banner.bgImageRelativeUrl);
        if (banner.fgImageRelativeUrl) paths.add(banner.fgImageRelativeUrl);
      }
      for (const img of bannerItemImages) {
        if (img.relativeUrl) paths.add(img.relativeUrl);
      }
      for (const img of bannerVendorImages) {
        if (img.relativeUrl) paths.add(img.relativeUrl);
      }
    }
  }

  return Array.from(paths);
}

export async function anonymizeAccountInPlace(
  tx: Prisma.TransactionClient,
  {
    userId,
    role,
    vendorId,
    now = new Date(),
  }: {
    userId: string;
    role: string;
    vendorId?: string;
    now?: Date;
  },
): Promise<string[]> {
  const filesToDelete = await collectUserPiiFilePaths(tx, {
    userId,
    vendorId,
    includeCatalogMedia: false,
  });

  // 1. Delete transient / PII-only records belonging to user
  await Promise.all([
    tx.refreshToken.deleteMany({ where: { userId } }),
    tx.fCMToken.deleteMany({ where: { userId } }),
    tx.oTP.deleteMany({ where: { userId } }),
    tx.cart.deleteMany({ where: { userId } }),
    tx.bloodDetails.deleteMany({ where: { userId } }),
    tx.favouriteCustomerForVendor.deleteMany({ where: { userId } }),
    tx.favouriteVendorForCustomer.deleteMany({ where: { userId } }),
    tx.notification.deleteMany({ where: { userId } }),
  ]);

  // Mask PII in BloodRequest records while preserving audit trail
  await tx.bloodRequest.updateMany({
    where: { userId },
    data: {
      patientName: 'Anonymized Patient',
      patientMobileNumber: '0000000000',
      documentUrl: null,
      documentRelativeUrl: null,
      dynamicFieldData: Prisma.DbNull,
    },
  });

  // 2. Anonymize User while preserving id & referralCode
  await tx.user.update({
    where: { id: userId },
    data: {
      name: role === 'VENDOR' ? 'Deleted Vendor' : 'Deleted Customer',
      nameTamil: null,
      mobile: null,
      email: null,
      password: null,
      imageRef: null,
      relativeUrl: null,
      salt: uuidv4(),
      status: false,
      accountStatus: AccountStatus.DELETED,
      anonymizedAt: now,
    },
  });

  // 3. If Vendor, clean up KYC/PII & deactivate catalog while preserving orders/items/services
  if (vendorId) {
    await tx.cart.deleteMany({ where: { vendorId } });
    await tx.favouriteCustomerForVendor.deleteMany({ where: { vendorId } });
    await tx.favouriteVendorForCustomer.deleteMany({ where: { vendorId } });
    await tx.bankDetail.deleteMany({ where: { vendorId } });

    const shopInfo = await tx.shopInfo.findUnique({
      where: { vendorId },
      select: { id: true },
    });

    if (shopInfo) {
      // Deleting License frees unique licenseNo and purges KYC document info
      await tx.license.deleteMany({ where: { shopInfoId: shopInfo.id } });
      await tx.shopWorkingHour.deleteMany({ where: { shopId: shopInfo.id } });

      await tx.shopInfo.update({
        where: { id: shopInfo.id },
        data: {
          name: 'Deleted Shop',
          nameTamil: null,
          address: 'Anonymized',
          addressTamil: null,
          pincode: '000000',
          latitude: 0,
          longitude: 0,
          shopImageRef: null,
          relativeUrl: null,
          dynamicValues: Prisma.DbNull,
          isShopOpen: false,
        },
      });

      await tx.$executeRaw`
        UPDATE "ShopInfo"
        SET "location" = NULL
        WHERE "id" = ${shopInfo.id}
      `;
    }

    await Promise.all([
      tx.item.updateMany({
        where: { vendorId },
        data: {
          status: Status.INACTIVE,
          productstatus: ProductStatus.OUT_OF_STOCK,
        },
      }),
      tx.service.updateMany({
        where: { vendorId },
        data: { status: Status.INACTIVE },
      }),
      tx.banner.updateMany({
        where: { vendorId },
        data: { status: 'INACTIVE' },
      }),
      tx.vendorServiceOption.updateMany({
        where: { vendorId },
        data: { status: Status.INACTIVE },
      }),
      tx.bannerVendorItem.updateMany({
        where: { vendorId },
        data: {
          status: Status.INACTIVE,
          productstatus: ProductStatus.OUT_OF_STOCK,
        },
      }),
    ]);

    // Deactivate & anonymize vendor's staff accounts
    const staffMembers = await tx.staff.findMany({
      where: { vendorId },
      select: { userId: true },
    });

    for (const staffMember of staffMembers) {
      await Promise.all([
        tx.refreshToken.deleteMany({ where: { userId: staffMember.userId } }),
        tx.fCMToken.deleteMany({ where: { userId: staffMember.userId } }),
        tx.oTP.deleteMany({ where: { userId: staffMember.userId } }),
        tx.notification.deleteMany({ where: { userId: staffMember.userId } }),
      ]);

      await tx.user.update({
        where: { id: staffMember.userId },
        data: {
          name: 'Deleted Staff',
          nameTamil: null,
          mobile: null,
          email: null,
          password: null,
          imageRef: null,
          relativeUrl: null,
          salt: uuidv4(),
          status: false,
          accountStatus: AccountStatus.DELETED,
          anonymizedAt: now,
        },
      });
    }
  }

  return filesToDelete;
}

export async function hardDeleteCleanAccount(
  tx: Prisma.TransactionClient,
  {
    userId,
    vendorId,
    referralCode,
  }: {
    userId: string;
    vendorId?: string;
    referralCode?: string | null;
  },
): Promise<string[]> {
  const filesToDelete = await collectUserPiiFilePaths(tx, {
    userId,
    vendorId,
    includeCatalogMedia: true,
  });

  if (referralCode) {
    await tx.retiredReferralCode.upsert({
      where: { code: referralCode },
      create: {
        code: referralCode,
        userId,
      },
      update: {},
    });
  }

  if (vendorId) {
    // Delete carts referencing vendor
    await tx.cart.deleteMany({ where: { vendorId } });

    // Delete banners & related images/keywords/items
    await tx.banner.deleteMany({ where: { vendorId } });
    await tx.bannerVendorItem.deleteMany({ where: { vendorId } });

    // Delete services & items & options & keywords
    await tx.service.deleteMany({ where: { vendorId } });
    await tx.item.deleteMany({ where: { vendorId } });
    await tx.serviceVendorKeyword.deleteMany({ where: { vendorId } });
    await tx.vendorServiceOption.deleteMany({ where: { vendorId } });

    // Delete vendor credits, bank details, shop info, favourites
    await tx.adminVendorCredit.deleteMany({ where: { vendorId } });
    await tx.bankDetail.deleteMany({ where: { vendorId } });
    await tx.favouriteCustomerForVendor.deleteMany({ where: { vendorId } });
    await tx.favouriteVendorForCustomer.deleteMany({ where: { vendorId } });
    await tx.shopInfo.deleteMany({ where: { vendorId } });

    // Handle staff members under this vendor
    const staffRows = await tx.staff.findMany({
      where: { vendorId },
      select: { id: true, userId: true },
    });

    await tx.staff.deleteMany({ where: { vendorId } });

    for (const staffRow of staffRows) {
      const staffActivity = await checkPreservableAccountActivity(tx, {
        userId: staffRow.userId,
      });

      if (staffActivity.hasActivity) {
        await anonymizeAccountInPlace(tx, {
          userId: staffRow.userId,
          role: 'STAFF',
        });
      } else {
        await Promise.all([
          tx.refreshToken.deleteMany({ where: { userId: staffRow.userId } }),
          tx.fCMToken.deleteMany({ where: { userId: staffRow.userId } }),
          tx.oTP.deleteMany({ where: { userId: staffRow.userId } }),
          tx.notification.deleteMany({ where: { userId: staffRow.userId } }),
        ]);
        await tx.user.delete({ where: { id: staffRow.userId } });
      }
    }

    await tx.vendor.delete({ where: { id: vendorId } });
  }

  // Delete all remaining non-cascading User child records before deleting User
  await Promise.all([
    tx.cart.deleteMany({ where: { userId } }),
    tx.refreshToken.deleteMany({ where: { userId } }),
    tx.fCMToken.deleteMany({ where: { userId } }),
    tx.oTP.deleteMany({ where: { userId } }),
    tx.notification.deleteMany({ where: { userId } }),
    tx.bloodDetails.deleteMany({ where: { userId } }),
    tx.favouriteCustomerForVendor.deleteMany({ where: { userId } }),
    tx.favouriteVendorForCustomer.deleteMany({ where: { userId } }),
    tx.wallet.deleteMany({ where: { userId } }),
  ]);

  await tx.user.delete({ where: { id: userId } });

  return filesToDelete;
}
