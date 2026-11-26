import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Prisma, Role } from '@prisma/client';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  anonymizeAccountInPlace,
  checkActiveTransactionsForDeletion,
  checkPreservableAccountActivity,
  hardDeleteCleanAccount,
} from './utils/account-activity.utils';

@Injectable()
export class AccountLifecycleService {
  private readonly logger = new Logger(AccountLifecycleService.name);
  private readonly defaultGraceDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {
    const parsedDays = Number(process.env.ACCOUNT_DELETION_GRACE_DAYS || '30');
    this.defaultGraceDays =
      Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 30;
  }

  /**
   * Customer or Vendor initiates 30-day soft delete.
   * Immediately disables account, logs out sessions, closes shop, and masks user info.
   */
  async requestSelfDeletion({
    userId,
    reason,
  }: {
    userId: string;
    reason?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.CUSTOMER && user.role !== Role.VENDOR) {
      throw new BadRequestException(
        'Only customer or vendor accounts can request self-deletion',
      );
    }

    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException('Account has already been deleted');
    }

    if (user.accountStatus === AccountStatus.PENDING_DELETION) {
      throw new BadRequestException(
        `Account deletion is already scheduled for ${user.scheduledDeletionAt?.toISOString()}`,
      );
    }

    const activeCheck = await checkActiveTransactionsForDeletion(this.prisma, {
      userId,
      vendorId: user.vendor?.id,
    });

    if (activeCheck.hasActiveTransactions) {
      throw new BadRequestException(
        `Cannot delete account while you have ${activeCheck.reasons.join(', ')}. Please complete or cancel them first.`,
      );
    }

    const now = new Date();
    const scheduledDeletionAt = new Date(
      now.getTime() + this.defaultGraceDays * 24 * 60 * 60 * 1000,
    );

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      return await this.applySoftDelete(tx, {
        userId: user.id,
        vendorId: user.vendor?.id,
        reason,
        now,
        scheduledDeletionAt,
      });
    });

    return {
      userId: updatedUser.id,
      role: updatedUser.role,
      accountStatus: updatedUser.accountStatus,
      deletionRequestedAt: updatedUser.deletionRequestedAt,
      scheduledDeletionAt: updatedUser.scheduledDeletionAt,
      gracePeriodDays: this.defaultGraceDays,
    };
  }

  /**
   * Reactivates a soft-deleted account inside the 30-day grace window.
   */
  async reactivatePendingAccount({
    userId,
    tx,
  }: {
    userId: string;
    tx?: Prisma.TransactionClient;
  }) {
    const run = async (db: Prisma.TransactionClient) => {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          vendor: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.accountStatus !== AccountStatus.PENDING_DELETION) {
        throw new BadRequestException(
          'Account is not in pending-deletion state',
        );
      }

      if (user.scheduledDeletionAt && user.scheduledDeletionAt <= new Date()) {
        throw new BadRequestException(
          'The 30-day reactivation window has expired',
        );
      }

      const restoredUser = await db.user.update({
        where: { id: user.id },
        data: {
          status: true,
          accountStatus: AccountStatus.ACTIVE,
          deletionRequestedAt: null,
          scheduledDeletionAt: null,
          deletionReason: null,
          salt: uuidv4(),
        },
        include: {
          vendor: {
            include: {
              shopInfo: {
                include: {
                  license: true,
                },
              },
              vendorServiceOption: {
                include: {
                  serviceOption: true,
                },
              },
              vendorType: true,
            },
          },
          staff: {
            include: {
              vendor: {
                include: {
                  shopInfo: {
                    include: {
                      license: true,
                    },
                  },
                },
              },
            },
          },
          bloodDetails: true,
        },
      });

      if (user.vendor?.id) {
        await db.staff
          .findMany({
            where: { vendorId: user.vendor.id },
            select: { userId: true },
          })
          .then(async (staffRows) => {
            const staffIds = staffRows.map((s) => s.userId);
            if (staffIds.length > 0) {
              await db.user.updateMany({
                where: {
                  id: { in: staffIds },
                  accountStatus: AccountStatus.PENDING_DELETION,
                },
                data: {
                  status: true,
                  accountStatus: AccountStatus.ACTIVE,
                  deletionRequestedAt: null,
                  scheduledDeletionAt: null,
                  deletionReason: null,
                },
              });
            }
          });
      }

      return restoredUser;
    };

    if (tx) {
      return await run(tx);
    }

    return await this.prisma.$transaction(async (innerTx) => run(innerTx));
  }

  /**
   * Cron batch job: processes all accounts whose 30-day grace window has expired.
   * - Clean accounts (no orders, bookings, payments, subscriptions, referrals, etc.) are permanently deleted.
   * - Accounts with historical data are anonymized in-place (mobile/email set to null, referralCode & orders/items preserved).
   */
  async processScheduledDeletions(): Promise<{
    processed: number;
    hardDeleted: number;
    anonymized: number;
    failed: number;
  }> {
    const now = new Date();
    const dueUsers = await this.prisma.user.findMany({
      where: {
        accountStatus: AccountStatus.PENDING_DELETION,
        scheduledDeletionAt: { lte: now },
      },
      include: {
        vendor: {
          select: { id: true },
        },
      },
    });

    let hardDeleted = 0;
    let anonymized = 0;
    let failed = 0;

    for (const dueUser of dueUsers) {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          const freshUser = await tx.user.findUnique({
            where: { id: dueUser.id },
            include: { vendor: { select: { id: true } } },
          });

          if (
            !freshUser ||
            freshUser.accountStatus !== AccountStatus.PENDING_DELETION
          ) {
            return { mode: 'skipped' as const, files: [] as string[] };
          }

          const activeCheck = await checkActiveTransactionsForDeletion(tx, {
            userId: freshUser.id,
            vendorId: freshUser.vendor?.id,
          });

          if (activeCheck.hasActiveTransactions) {
            throw new BadRequestException(
              `Skipped scheduled deletion due to ${activeCheck.reasons.join(', ')}`,
            );
          }

          const activity = await checkPreservableAccountActivity(tx, {
            userId: freshUser.id,
            vendorId: freshUser.vendor?.id,
            referralCode: freshUser.referralCode,
          });

          if (!activity.hasActivity) {
            const files = await hardDeleteCleanAccount(tx, {
              userId: freshUser.id,
              vendorId: freshUser.vendor?.id,
              referralCode: freshUser.referralCode,
            });
            return { mode: 'hardDeleted' as const, files };
          }

          const files = await anonymizeAccountInPlace(tx, {
            userId: freshUser.id,
            role: freshUser.role,
            vendorId: freshUser.vendor?.id,
            now,
          });
          return { mode: 'anonymized' as const, files };
        });

        for (const filePath of result.files) {
          this.fileUploadService.handleSingleFileDeletion(filePath);
        }

        if (result.mode === 'hardDeleted') {
          hardDeleted++;
        } else if (result.mode === 'anonymized') {
          anonymized++;
        }
      } catch (error: unknown) {
        failed++;
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed processing scheduled deletion for user ${dueUser.id}: ${msg}`,
        );
      }
    }

    return {
      processed: hardDeleted + anonymized,
      hardDeleted,
      anonymized,
      failed,
    };
  }

  /**
   * Admin: soft-deletes an account for 30 days.
   */
  async adminSoftDeleteAccount({
    userId,
    reason,
  }: {
    userId: string;
    reason?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: { select: { id: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be deleted');
    }
    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException(
        'Account is already permanently anonymized',
      );
    }

    const activeCheck = await checkActiveTransactionsForDeletion(this.prisma, {
      userId: user.id,
      vendorId: user.vendor?.id,
    });
    if (activeCheck.hasActiveTransactions) {
      throw new BadRequestException(
        `Cannot soft-delete account with ${activeCheck.reasons.join(', ')}.`,
      );
    }

    const now = new Date();
    const scheduledDeletionAt = new Date(
      now.getTime() + this.defaultGraceDays * 24 * 60 * 60 * 1000,
    );

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      return await this.applySoftDelete(tx, {
        userId: user.id,
        vendorId: user.vendor?.id,
        reason,
        now,
        scheduledDeletionAt,
      });
    });

    return updatedUser;
  }

  /**
   * Admin: immediately permanently deletes a clean User/Vendor (no orders, bookings, payments, subscriptions, referrals, etc.).
   * Rejects if historical records exist and instructs Admin to anonymize instead.
   */
  async adminPermanentDeleteUser({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          include: {
            shopInfo: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be deleted');
    }

    const { filesToDelete, deletedSummary } = await this.prisma.$transaction(
      async (tx) => {
        const activity = await checkPreservableAccountActivity(tx, {
          userId: user.id,
          vendorId: user.vendor?.id,
          referralCode: user.referralCode,
        });

        if (activity.hasActivity) {
          throw new BadRequestException(
            `Cannot permanently delete account because it has existing ${activity.reasons.join(', ')}. Use anonymization instead to preserve history.`,
          );
        }

        const files = await hardDeleteCleanAccount(tx, {
          userId: user.id,
          vendorId: user.vendor?.id,
          referralCode: user.referralCode,
        });

        return {
          filesToDelete: files,
          deletedSummary: {
            deletedUserId: user.id,
            deletedVendorId: user.vendor?.id ?? null,
            role: user.role,
            retiredReferralCode: user.referralCode ?? null,
          },
        };
      },
    );

    for (const filePath of filesToDelete) {
      this.fileUploadService.handleSingleFileDeletion(filePath);
    }

    return deletedSummary;
  }

  async adminPermanentDeleteVendor({ vendorId }: { vendorId: string }) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, userId: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return await this.adminPermanentDeleteUser({
      userId: vendor.userId,
    });
  }

  /**
   * Admin: immediately anonymizes an account with historical records (orders/bookings/referrals preserved, mobile/email freed).
   */
  async adminAnonymizeAccount({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: { include: { shopInfo: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be anonymized');
    }
    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException('Account is already anonymized');
    }

    const activeCheck = await checkActiveTransactionsForDeletion(this.prisma, {
      userId: user.id,
      vendorId: user.vendor?.id,
    });
    if (activeCheck.hasActiveTransactions) {
      throw new BadRequestException(
        `Cannot anonymize account with ${activeCheck.reasons.join(', ')}.`,
      );
    }

    const now = new Date();
    const filesToDelete = await this.prisma.$transaction(async (tx) => {
      return await anonymizeAccountInPlace(tx, {
        userId: user.id,
        role: user.role,
        vendorId: user.vendor?.id,
        now,
      });
    });

    for (const filePath of filesToDelete) {
      this.fileUploadService.handleSingleFileDeletion(filePath);
    }

    return {
      userId: user.id,
      vendorId: user.vendor?.id ?? null,
      accountStatus: AccountStatus.DELETED,
      anonymizedAt: now,
      referralCodePreserved: user.referralCode ?? null,
    };
  }

  /**
   * Admin: restores a PENDING_DELETION or SUSPENDED account back to ACTIVE.
   */
  async adminRestoreAccount({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: { select: { id: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException(
        'Permanently anonymized accounts cannot be restored',
      );
    }

    if (user.accountStatus === AccountStatus.ACTIVE && user.status === true) {
      throw new BadRequestException('Account is already active');
    }

    return await this.prisma.$transaction(async (tx) => {
      const restored = await tx.user.update({
        where: { id: user.id },
        data: {
          status: true,
          accountStatus: AccountStatus.ACTIVE,
          deletionRequestedAt: null,
          scheduledDeletionAt: null,
          deletionReason: null,
          salt: uuidv4(),
        },
      });

      if (user.vendor?.id) {
        const staffRows = await tx.staff.findMany({
          where: { vendorId: user.vendor.id },
          select: { userId: true },
        });
        const staffUserIds = staffRows.map((s) => s.userId);
        if (staffUserIds.length > 0) {
          await tx.user.updateMany({
            where: {
              id: { in: staffUserIds },
              accountStatus: {
                in: [AccountStatus.PENDING_DELETION, AccountStatus.SUSPENDED],
              },
            },
            data: {
              status: true,
              accountStatus: AccountStatus.ACTIVE,
              deletionRequestedAt: null,
              scheduledDeletionAt: null,
              deletionReason: null,
            },
          });
        }
      }

      return restored;
    });
  }

  private async applySoftDelete(
    tx: Prisma.TransactionClient,
    {
      userId,
      vendorId,
      reason,
      now,
      scheduledDeletionAt,
    }: {
      userId: string;
      vendorId?: string;
      reason?: string;
      now: Date;
      scheduledDeletionAt: Date;
    },
  ) {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        status: false,
        accountStatus: AccountStatus.PENDING_DELETION,
        deletionRequestedAt: now,
        scheduledDeletionAt,
        deletionReason: reason ?? null,
        salt: uuidv4(),
      },
    });

    await Promise.all([
      tx.refreshToken.deleteMany({ where: { userId } }),
      tx.fCMToken.deleteMany({ where: { userId } }),
      tx.cart.deleteMany({ where: { userId } }),
      tx.bloodDetails.updateMany({
        where: { userId },
        data: { isDonor: false },
      }),
    ]);

    if (vendorId) {
      await Promise.all([
        tx.cart.deleteMany({ where: { vendorId } }),
        tx.shopInfo.updateMany({
          where: { vendorId },
          data: { isShopOpen: false },
        }),
      ]);

      const staffRows = await tx.staff.findMany({
        where: { vendorId },
        select: { userId: true },
      });

      for (const staffRow of staffRows) {
        await Promise.all([
          tx.refreshToken.deleteMany({ where: { userId: staffRow.userId } }),
          tx.fCMToken.deleteMany({ where: { userId: staffRow.userId } }),
          tx.user.update({
            where: { id: staffRow.userId },
            data: {
              status: false,
              accountStatus: AccountStatus.PENDING_DELETION,
              deletionRequestedAt: now,
              scheduledDeletionAt,
              salt: uuidv4(),
            },
          }),
        ]);
      }
    }

    return updatedUser;
  }
}
