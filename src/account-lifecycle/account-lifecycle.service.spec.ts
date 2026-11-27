import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AccountStatus, Role } from '@prisma/client';
import { AccountLifecycleService } from './account-lifecycle.service';

describe('AccountLifecycleService', () => {
  let service: AccountLifecycleService;
  let prismaMock: any;
  let fileUploadMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      order: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      wallet: {
        findUnique: jest.fn().mockResolvedValue(null),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      orderSettlement: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      review: {
        count: jest.fn().mockResolvedValue(0),
      },
      bloodRequest: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      accountDeletionAudit: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    fileUploadMock = {
      handleSingleFileDeletion: jest.fn(),
    };

    service = new AccountLifecycleService(prismaMock, fileUploadMock);
  });

  describe('selfDeleteAccount', () => {
    it('throws NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.selfDeleteAccount({ userId: 'missing-user' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for ADMIN role', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        role: Role.ADMIN,
      });

      await expect(
        service.selfDeleteAccount({ userId: 'admin-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('blocks self-deletion when user has active orders', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'cust-1',
        role: Role.CUSTOMER,
        accountStatus: AccountStatus.ACTIVE,
      });
      prismaMock.order.findFirst.mockResolvedValue({ id: 'active-ord' });

      await expect(
        service.selfDeleteAccount({ userId: 'cust-1' }),
      ).rejects.toThrow('Cannot delete account while you have active customer orders in progress');
    });
  });

  describe('reactivatePendingAccount', () => {
    it('reactivates vendor and cascades reactivation to staff accounts', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'vendor-user-1',
        accountStatus: AccountStatus.PENDING_DELETION,
        scheduledDeletionAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        vendor: { id: 'vendor-1' },
      });
      prismaMock.user.update.mockResolvedValue({
        id: 'vendor-user-1',
        accountStatus: AccountStatus.ACTIVE,
      });
      prismaMock.staff = {
        findMany: jest.fn().mockResolvedValue([{ userId: 'staff-user-1' }]),
      };
      prismaMock.user.updateMany = jest.fn().mockResolvedValue({ count: 1 });

      const result = await service.reactivatePendingAccount({
        userId: 'vendor-user-1',
      });

      expect(result.success).toBe(true);
      expect(result.accountStatus).toBe(AccountStatus.ACTIVE);
      expect(result.reactivatedStaffCount).toBe(1);
      expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['staff-user-1'] },
          accountStatus: AccountStatus.PENDING_DELETION,
        },
        data: expect.objectContaining({
          status: true,
          accountStatus: AccountStatus.ACTIVE,
        }),
      });
    });
  });

  describe('adminHardDelete', () => {
    it('throws BadRequestException when attempting to hard delete an ADMIN', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'admin-target',
        role: Role.ADMIN,
      });

      await expect(
        service.adminHardDelete({
          userId: 'admin-target',
          adminId: 'admin-super',
        }),
      ).rejects.toThrow('Admin accounts cannot be deleted');
    });
  });

  describe('processScheduledDeletions', () => {
    it('hard deletes clean accounts and soft deletes accounts with historical activity', async () => {
      const now = new Date();
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'user-clean', accountStatus: AccountStatus.PENDING_DELETION },
        { id: 'user-with-history', accountStatus: AccountStatus.PENDING_DELETION },
      ]);

      // No active in-flight transactions
      prismaMock.order.findFirst.mockResolvedValue(null);
      prismaMock.booking.findFirst.mockResolvedValue(null);
      prismaMock.wallet.findUnique.mockResolvedValue(null);
      prismaMock.payment.findFirst.mockResolvedValue(null);

      // user-clean has 0 orders, user-with-history has 2 orders
      prismaMock.order.count = jest.fn(({ where }) => {
        if (where.userId === 'user-with-history') return Promise.resolve(2);
        return Promise.resolve(0);
      });
      prismaMock.booking.count = jest.fn().mockResolvedValue(0);
      prismaMock.payment.count = jest.fn().mockResolvedValue(0);
      prismaMock.review.count = jest.fn().mockResolvedValue(0);
      prismaMock.bloodRequest.count = jest.fn().mockResolvedValue(0);

      // findUnique mock for both clean and history user
      prismaMock.user.findUnique = jest.fn(({ where }) => {
        return Promise.resolve({
          id: where.id,
          name: 'Test',
          role: Role.CUSTOMER,
          wallet: null,
          vendor: null,
        });
      });

      prismaMock.bloodRequest.findMany = jest.fn().mockResolvedValue([]);
      prismaMock.cart = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.refreshToken = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.fCMToken = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.oTP = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.notification = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.bloodDetails = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.favouriteCustomerForVendor = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.favouriteVendorForCustomer = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      prismaMock.bloodRequest.updateMany = jest.fn().mockResolvedValue({ count: 0 });

      const result = await service.processScheduledDeletions();

      expect(result.processed).toBe(2);
      expect(result.hardDeleted).toBe(1);
      expect(result.softDeleted).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});
