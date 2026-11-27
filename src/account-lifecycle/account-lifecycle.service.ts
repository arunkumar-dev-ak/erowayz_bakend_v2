import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AccountStatus, Role } from '@prisma/client';
import { FileUploadService } from '../file-upload/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  checkActiveTransactionsForDeletion,
  checkHistoricalBusinessActivity,
  hardDeleteUserAndVendorRecords,
  permanentSoftDeleteWithPiiScrubbing,
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
   * Common Self-Delete: Customer or Vendor initiates account deactivation.
   * Checks for in-flight orders, bookings, and pending coins.
   * If clean, disables account, invalidates sessions, closes vendor shop, and schedules deletion.
   */
  async selfDeleteAccount({
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
      throw new NotFoundException('User account not found');
    }

    if (user.role !== Role.CUSTOMER && user.role !== Role.VENDOR) {
      throw new BadRequestException(
        'Only customer or vendor accounts can request self-deletion',
      );
    }

    if (user.accountStatus === AccountStatus.DELETED) {
      throw new BadRequestException(
        'This account has already been permanently deleted',
      );
    }

    if (user.accountStatus === AccountStatus.PENDING_DELETION) {
      throw new BadRequestException(
        `Account deletion is already scheduled for ${user.scheduledDeletionAt?.toISOString()}`,
      );
    }

    // 1. Check for active orders, bookings, pending payments, or locked coins
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

    // 2. Perform soft deactivation and session invalidation
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          status: false,
          accountStatus: AccountStatus.PENDING_DELETION,
          deletionRequestedAt: now,
          scheduledDeletionAt,
          deletionReason: reason ?? null,
          salt: uuidv4(),
        },
      });

      // Clear sessions, FCM push tokens, and cart
      await Promise.all([
        tx.refreshToken.deleteMany({ where: { userId: user.id } }),
        tx.fCMToken.deleteMany({ where: { userId: user.id } }),
        tx.cart.deleteMany({ where: { userId: user.id } }),
        tx.bloodDetails.updateMany({
          where: { userId: user.id },
          data: { isDonor: false },
        }),
      ]);

      // If vendor, close shop and cascade deactivation to staff
      if (user.vendor?.id) {
        await Promise.all([
          tx.cart.deleteMany({ where: { vendorId: user.vendor.id } }),
          tx.shopInfo.updateMany({
            where: { vendorId: user.vendor.id },
            data: { isShopOpen: false },
          }),
        ]);

        const staffRows = await tx.staff.findMany({
          where: { vendorId: user.vendor.id },
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

      return updated;
    });

    return {
      success: true,
      message:
        'Account has been deactivated and scheduled for deletion. You will be logged out on all devices.',
      userId: updatedUser.id,
      role: updatedUser.role,
      accountStatus: updatedUser.accountStatus,
      deletionRequestedAt: updatedUser.deletionRequestedAt,
      scheduledDeletionAt: updatedUser.scheduledDeletionAt,
      gracePeriodDays: this.defaultGraceDays,
    };
  }

  /**
   * Reactivates an account inside the grace window.
   * If the account is a vendor, automatically reactivates all staff accounts that were soft-deleted.
   */
  async reactivatePendingAccount({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendor: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.accountStatus !== AccountStatus.PENDING_DELETION) {
      throw new BadRequestException('Account is not in pending-deletion state');
    }

    if (user.scheduledDeletionAt && user.scheduledDeletionAt <= new Date()) {
      throw new BadRequestException(
        'The reactivation window has expired. The account is queued for permanent removal.',
      );
    }

    let reactivatedStaffCount = 0;

    const restoredUser = await this.prisma.$transaction(async (tx) => {
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

      // If Vendor, also reactivate all staff members who were placed in PENDING_DELETION
      if (user.vendor?.id) {
        const staffRows = await tx.staff.findMany({
          where: { vendorId: user.vendor.id },
          select: { userId: true },
        });

        const staffUserIds = staffRows.map((s) => s.userId);

        if (staffUserIds.length > 0) {
          const updateResult = await tx.user.updateMany({
            where: {
              id: { in: staffUserIds },
              accountStatus: AccountStatus.PENDING_DELETION,
            },
            data: {
              status: true,
              accountStatus: AccountStatus.ACTIVE,
              deletionRequestedAt: null,
              scheduledDeletionAt: null,
              deletionReason: null,
              salt: uuidv4(),
            },
          });

          reactivatedStaffCount = updateResult.count;
        }
      }

      return restored;
    });

    return {
      success: true,
      message: 'Account reactivated successfully',
      userId: restoredUser.id,
      accountStatus: restoredUser.accountStatus,
      reactivatedStaffCount,
    };
  }

  /**
   * Admin Permanent Delete (Hard Delete).
   * Checks pending coins and active transactions from both customer and vendor sides.
   * If wallet coins exist, logs an audit record in AccountDeletionAudit for refund tracking.
   * Completely purges the account and associated files.
   */
  async adminHardDelete({
    userId,
    adminId,
    reason,
  }: {
    userId: string;
    adminId: string;
    reason?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Admin accounts cannot be deleted');
    }

    // Check for in-flight transactions or pending coins from both sides
    const activeCheck = await checkActiveTransactionsForDeletion(this.prisma, {
      userId: user.id,
      vendorId: user.vendor?.id,
    });

    if (activeCheck.hasActiveTransactions) {
      throw new BadRequestException(
        `Cannot permanently delete account while there are ${activeCheck.reasons.join(', ')}. Please ensure they are completed, cancelled, or settled first.`,
      );
    }

    // Execute hard delete within a single transaction
    const { filesToDelete, auditLogged, walletCoinsLogged } =
      await this.prisma.$transaction(async (tx) => {
        return await hardDeleteUserAndVendorRecords(tx, {
          userId: user.id,
          adminId,
          reason,
          deletionType: 'ADMIN_HARD_DELETE',
        });
      });

    // Delete uploaded files asynchronously from disk
    for (const filePath of filesToDelete) {
      this.fileUploadService.handleSingleFileDeletion(filePath);
    }

    return {
      success: true,
      message: 'User account permanently deleted successfully',
      deletedUserId: user.id,
      name: user.name,
      role: user.role,
      auditLogCreated: auditLogged,
      remainingCoinsLogged: walletCoinsLogged,
    };
  }

  /**
   * Scheduled Cron Job: Executes daily at 2:00 AM IST.
   * Processes all accounts whose 30-day grace period has expired (scheduledDeletionAt <= now):
   * - If account has NO historical orders/bookings/payments -> Full Hard Delete.
   * - If account HAS historical business activity / sensitive data -> Permanent Soft Delete (scrubs PII, preserves audit trail).
   * - If wallet coins exist in either case -> Logs audit record in AccountDeletionAudit for refunds.
   */
  async processScheduledDeletions(): Promise<{
    processed: number;
    hardDeleted: number;
    softDeleted: number;
    skipped: number;
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

    this.logger.log(
      `Running scheduled account deletions: found ${dueUsers.length} due accounts.`,
    );

    let hardDeleted = 0;
    let softDeleted = 0;
    let skipped = 0;
    let failed = 0;

    for (const dueUser of dueUsers) {
      try {
        // 1. Check if user still has in-flight transactions or locked coins
        const activeCheck = await checkActiveTransactionsForDeletion(this.prisma, {
          userId: dueUser.id,
          vendorId: dueUser.vendor?.id,
        });

        if (activeCheck.hasActiveTransactions) {
          this.logger.warn(
            `Skipping scheduled deletion for user ${dueUser.id} due to in-flight activity: ${activeCheck.reasons.join(', ')}`,
          );
          skipped++;
          continue;
        }

        // 2. Check if user has historical business records (orders, bookings, reviews, payments)
        const historical = await checkHistoricalBusinessActivity(this.prisma, {
          userId: dueUser.id,
          vendorId: dueUser.vendor?.id,
        });

        let filesToDelete: string[] = [];

        if (!historical.hasHistoricalData) {
          // Case A: Clean Account -> Full Hard Delete
          const result = await this.prisma.$transaction(async (tx) => {
            return await hardDeleteUserAndVendorRecords(tx, {
              userId: dueUser.id,
              reason: 'Scheduled permanent hard delete (clean account with zero history)',
              deletionType: 'SCHEDULED_HARD_DELETE',
            });
          });
          filesToDelete = result.filesToDelete;
          hardDeleted++;
          this.logger.log(`Hard deleted clean account: ${dueUser.id}`);
        } else {
          // Case B: Has Historical Data -> Permanent Soft Delete with PII Scrubbing
          const result = await this.prisma.$transaction(async (tx) => {
            return await permanentSoftDeleteWithPiiScrubbing(tx, {
              userId: dueUser.id,
              reason: `Scheduled permanent soft delete (preserving: ${historical.reasons.join(', ')})`,
            });
          });
          filesToDelete = result.filesToDelete;
          softDeleted++;
          this.logger.log(
            `Permanently soft-deleted account with history: ${dueUser.id} (${historical.reasons.join(', ')})`,
          );
        }

        // 3. Delete files from disk storage
        for (const filePath of filesToDelete) {
          this.fileUploadService.handleSingleFileDeletion(filePath);
        }
      } catch (err: any) {
        failed++;
        this.logger.error(
          `Failed processing scheduled deletion for user ${dueUser.id}: ${err.message}`,
          err.stack,
        );
      }
    }

    return {
      processed: hardDeleted + softDeleted,
      hardDeleted,
      softDeleted,
      skipped,
      failed,
    };
  }

  /**
   * Admin: Queries deletion audit logs to check remaining coins for refund requests.
   */
  async getDeletionAuditLogs({
    mobile,
    email,
    originalUserId,
    refundClaimed,
    offset = 0,
    limit = 20,
  }: {
    mobile?: string;
    email?: string;
    originalUserId?: string;
    refundClaimed?: boolean;
    offset?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (mobile) {
      where.mobile = { contains: mobile };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (originalUserId) {
      where.originalUserId = originalUserId;
    }
    if (refundClaimed !== undefined) {
      where.refundClaimed = refundClaimed;
    }

    const [total, audits] = await Promise.all([
      this.prisma.accountDeletionAudit.count({ where }),
      this.prisma.accountDeletionAudit.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total,
      offset,
      limit,
      audits,
    };
  }

  /**
   * Admin: Marks a coin refund as claimed.
   */
  async claimRefund({
    auditId,
    notes,
  }: {
    auditId: string;
    notes?: string;
  }) {
    const audit = await this.prisma.accountDeletionAudit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new NotFoundException('Audit log not found');
    }

    if (audit.refundClaimed) {
      throw new BadRequestException('Refund has already been marked as claimed');
    }

    const updated = await this.prisma.accountDeletionAudit.update({
      where: { id: auditId },
      data: {
        refundClaimed: true,
        notes: notes ? `${audit.notes ?? ''} | Claim note: ${notes}` : audit.notes,
      },
    });

    return {
      success: true,
      message: 'Refund marked as claimed successfully',
      audit: updated,
    };
  }
}
