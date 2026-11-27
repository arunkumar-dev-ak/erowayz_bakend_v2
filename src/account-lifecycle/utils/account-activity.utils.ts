import { AccountStatus, Prisma, ProductStatus, Role, Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

export interface ActiveTransactionCheckResult {
  hasActiveTransactions: boolean;
  reasons: string[];
}

export interface HistoricalActivityCheckResult {
  hasHistoricalData: boolean;
  reasons: string[];
}

/**
 * Validates whether the user or vendor has active/in-flight transactions or pending coins
 * that must be completed, cancelled, or settled before account deletion can proceed.
 */
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
    unpaidVendorSettlement,
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
      select: { lockedBalance: true, locked: true },
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
    vendorId
      ? prisma.orderSettlement.findFirst({
          where: {
            vendorId,
            status: 'UNPAID',
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (activeCustomerOrder) {
    reasons.push('active customer orders in progress');
  }
  if (activeCustomerBooking) {
    reasons.push('active customer service/banner bookings in progress');
  }
  if (activeVendorOrder) {
    reasons.push('active incoming vendor orders awaiting fulfillment');
  }
  if (activeVendorBooking) {
    reasons.push('active incoming vendor bookings awaiting fulfillment');
  }
  if (wallet && (wallet.lockedBalance > 0 || wallet.locked)) {
    reasons.push('locked wallet coins associated with ongoing transactions');
  }
  if (pendingPayment) {
    reasons.push('an active pending online payment checkout session');
  }
  if (unpaidVendorSettlement) {
    reasons.push('unpaid vendor order settlements awaiting payout');
  }

  return {
    hasActiveTransactions: reasons.length > 0,
    reasons,
  };
}

/**
 * Checks whether the user or vendor has historical business activity / sensitive transaction data
 * (orders, bookings, payments, reviews) that must be preserved for financial & audit compliance.
 */
export async function checkHistoricalBusinessActivity(
  prisma: PrismaClientLike,
  {
    userId,
    vendorId,
  }: {
    userId: string;
    vendorId?: string;
  },
): Promise<HistoricalActivityCheckResult> {
  const reasons: string[] = [];

  const [
    customerOrdersCount,
    customerBookingsCount,
    paymentsCount,
    reviewsCount,
    bloodRequestsCount,
    vendorOrderItemsCount,
    vendorServiceBookingsCount,
    vendorBannerBookingsCount,
  ] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.booking.count({ where: { userId } }),
    prisma.payment.count({ where: { userId } }),
    prisma.review.count({
      where: { OR: [{ userId }, ...(vendorId ? [{ vendorId }] : [])] },
    }),
    prisma.bloodRequest.count({ where: { userId } }),
    vendorId
      ? prisma.orderItem.count({ where: { item: { vendorId } } })
      : Promise.resolve(0),
    vendorId
      ? prisma.serviceBooking.count({
          where: {
            vendorSubService: { service: { vendorId } },
          },
        })
      : Promise.resolve(0),
    vendorId
      ? prisma.bannerBooking.count({ where: { vendorId } })
      : Promise.resolve(0),
  ]);

  if (customerOrdersCount > 0) reasons.push('customer placed orders');
  if (customerBookingsCount > 0) reasons.push('customer service/banner bookings');
  if (paymentsCount > 0) reasons.push('financial payment transaction records');
  if (reviewsCount > 0) reasons.push('customer reviews');
  if (bloodRequestsCount > 0) reasons.push('blood request audit records');
  if (vendorOrderItemsCount > 0) reasons.push('fulfilled vendor orders');
  if (vendorServiceBookingsCount > 0) reasons.push('fulfilled vendor service bookings');
  if (vendorBannerBookingsCount > 0) reasons.push('fulfilled vendor banner bookings');

  return {
    hasHistoricalData: reasons.length > 0,
    reasons,
  };
}

/**
 * Collects relative file paths belonging to the user and vendor to delete from storage.
 */
export async function collectUserPiiFilePaths(
  tx: Prisma.TransactionClient,
  {
    userId,
    vendorId,
    includeCatalogMedia = true,
  }: {
    userId: string;
    vendorId?: string;
    includeCatalogMedia?: boolean;
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

/**
 * Hard-deletes all database records for a User (and Vendor if applicable).
 * Only used for clean accounts without historical transaction records.
 * If wallet coins/balance exist, writes an audit record into AccountDeletionAudit.
 */
export async function hardDeleteUserAndVendorRecords(
  tx: Prisma.TransactionClient,
  {
    userId,
    adminId,
    reason,
    deletionType,
  }: {
    userId: string;
    adminId?: string;
    reason?: string;
    deletionType?: string;
  },
): Promise<{
  filesToDelete: string[];
  auditLogged: boolean;
  walletCoinsLogged: number;
}> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    include: {
      vendor: {
        include: {
          shopInfo: true,
        },
      },
      wallet: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const vendorId = user.vendor?.id;
  const filesToDelete = await collectUserPiiFilePaths(tx, {
    userId,
    vendorId,
    includeCatalogMedia: true,
  });

  // 1. Audit Log: If wallet has balance/coins, record in AccountDeletionAudit
  let auditLogged = false;
  let walletCoinsLogged = 0;

  if (user.wallet && (user.wallet.balance > 0 || user.wallet.lockedBalance > 0)) {
    walletCoinsLogged = user.wallet.balance;
    const walletInfo = {
      walletId: user.wallet.id,
      balance: user.wallet.balance,
      lockedBalance: user.wallet.lockedBalance,
      isLocked: user.wallet.locked,
      recordedAt: new Date().toISOString(),
    };

    const finalDeletionType =
      deletionType ?? (adminId ? 'ADMIN_HARD_DELETE' : 'SELF_DELETE');

    await tx.accountDeletionAudit.create({
      data: {
        originalUserId: user.id,
        vendorId: vendorId ?? null,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        deletionType: finalDeletionType,
        deletedByAdminId: adminId ?? null,
        walletInfo,
        refundClaimed: false,
        notes: reason ?? (adminId ? 'Permanently hard deleted by admin' : 'Self hard deletion'),
      },
    });

    auditLogged = true;
  }

  // 2. Vendor Cleanup
  if (vendorId) {
    await tx.cart.deleteMany({ where: { vendorId } });
    await tx.bannerVendorItem.deleteMany({ where: { vendorId } });
    await tx.banner.deleteMany({ where: { vendorId } });

    await tx.service.deleteMany({ where: { vendorId } });
    await tx.item.deleteMany({ where: { vendorId } });
    await tx.serviceVendorKeyword.deleteMany({ where: { vendorId } });
    await tx.vendorServiceOption.deleteMany({ where: { vendorId } });

    await tx.adminVendorCredit.deleteMany({ where: { vendorId } });
    await tx.bankDetail.deleteMany({ where: { vendorId } });
    await tx.favouriteCustomerForVendor.deleteMany({ where: { vendorId } });
    await tx.favouriteVendorForCustomer.deleteMany({ where: { vendorId } });
    await tx.shopInfo.deleteMany({ where: { vendorId } });

    // Clean up vendor subscription and usage
    await tx.vendorFeatureUsage.deleteMany({
      where: { vendorSubscription: { vendorId } },
    });
    await tx.vendorSubscription.deleteMany({ where: { vendorId } });
    await tx.vendorReferral.deleteMany({
      where: { OR: [{ referrerId: vendorId }, { refereeId: vendorId }] },
    });
    await tx.vendorRating.deleteMany({ where: { vendorId } });
    await tx.orderSettlement.deleteMany({ where: { vendorId } });

    const staffRows = await tx.staff.findMany({
      where: { vendorId },
      select: { id: true, userId: true },
    });

    await tx.staff.deleteMany({ where: { vendorId } });

    for (const staffRow of staffRows) {
      await Promise.all([
        tx.refreshToken.deleteMany({ where: { userId: staffRow.userId } }),
        tx.fCMToken.deleteMany({ where: { userId: staffRow.userId } }),
        tx.oTP.deleteMany({ where: { userId: staffRow.userId } }),
        tx.notification.deleteMany({ where: { userId: staffRow.userId } }),
      ]);
      await tx.user.delete({ where: { id: staffRow.userId } });
    }

    await tx.vendor.delete({ where: { id: vendorId } });
  }

  // 3. User Cleanup
  if (user.wallet) {
    await tx.walletTransaction.deleteMany({
      where: {
        OR: [
          { senderWalletId: user.wallet.id },
          { receiverWalletId: user.wallet.id },
        ],
      },
    });
  }

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

  return {
    filesToDelete,
    auditLogged,
    walletCoinsLogged,
  };
}

/**
 * Permanent Soft Delete with PII Scrubbing.
 * Used when accounts have historical business records (orders, bookings, payments, reviews)
 * that cannot be foreign-key deleted from PostgreSQL.
 * Scrubs all sensitive personal credentials/data, frees up mobile & email, and marks DELETED.
 */
export async function permanentSoftDeleteWithPiiScrubbing(
  tx: Prisma.TransactionClient,
  {
    userId,
    reason = 'Scheduled permanent soft delete: historical records preserved, sensitive PII scrubbed',
  }: {
    userId: string;
    reason?: string;
  },
): Promise<{
  filesToDelete: string[];
  auditLogged: boolean;
  walletCoinsLogged: number;
}> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    include: {
      vendor: {
        include: {
          shopInfo: true,
        },
      },
      wallet: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const vendorId = user.vendor?.id;
  const filesToDelete = await collectUserPiiFilePaths(tx, {
    userId,
    vendorId,
    includeCatalogMedia: false,
  });

  let auditLogged = false;
  let walletCoinsLogged = 0;

  // 1. Audit wallet coins if balance exists
  if (user.wallet && (user.wallet.balance > 0 || user.wallet.lockedBalance > 0)) {
    walletCoinsLogged = user.wallet.balance;
    const walletInfo = {
      walletId: user.wallet.id,
      balance: user.wallet.balance,
      lockedBalance: user.wallet.lockedBalance,
      isLocked: user.wallet.locked,
      recordedAt: new Date().toISOString(),
    };

    await tx.accountDeletionAudit.create({
      data: {
        originalUserId: user.id,
        vendorId: vendorId ?? null,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        deletionType: 'SCHEDULED_SOFT_DELETE',
        deletedByAdminId: null,
        walletInfo,
        refundClaimed: false,
        notes: reason,
      },
    });

    auditLogged = true;
  }

  // 2. Delete sensitive personal sessions, push tokens, carts, blood details, favourites
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

  // Anonymize BloodRequest PII
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

  const now = new Date();

  // 3. Scrub sensitive user credentials & PII while keeping the user ID and original name intact for audit & source of truth
  await tx.user.update({
    where: { id: userId },
    data: {
      // Keep user.name intact as the source of truth for receipts/invoices
      nameTamil: null,
      mobile: null, // Frees up phone number
      email: null,  // Frees up email
      password: null,
      imageRef: null,
      relativeUrl: null,
      salt: uuidv4(),
      status: false,
      accountStatus: AccountStatus.DELETED,
      anonymizedAt: now,
    },
  });

  // 4. If Vendor, close shop, de-link KYC licenses, deactivate catalog & cascade to staff
  if (vendorId) {
    await tx.cart.deleteMany({ where: { vendorId } });
    await tx.bankDetail.deleteMany({ where: { vendorId } });
    await tx.favouriteCustomerForVendor.deleteMany({ where: { vendorId } });
    await tx.favouriteVendorForCustomer.deleteMany({ where: { vendorId } });

    const shopInfo = await tx.shopInfo.findUnique({
      where: { vendorId },
      select: { id: true },
    });

    if (shopInfo) {
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
    }

    // Deactivate catalog items, services, banners
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

    // Deactivate and scrub staff accounts
    const staffMembers = await tx.staff.findMany({
      where: { vendorId },
      select: { userId: true },
    });

    for (const staff of staffMembers) {
      await Promise.all([
        tx.refreshToken.deleteMany({ where: { userId: staff.userId } }),
        tx.fCMToken.deleteMany({ where: { userId: staff.userId } }),
        tx.oTP.deleteMany({ where: { userId: staff.userId } }),
        tx.notification.deleteMany({ where: { userId: staff.userId } }),
      ]);

      await tx.user.update({
        where: { id: staff.userId },
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

  return {
    filesToDelete,
    auditLogged,
    walletCoinsLogged,
  };
}
