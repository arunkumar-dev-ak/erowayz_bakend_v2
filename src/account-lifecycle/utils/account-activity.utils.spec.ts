import { Prisma } from '@prisma/client';
import { checkActiveTransactionsForDeletion } from './account-activity.utils';

describe('Account Activity Deletion Safety', () => {
  it('detects active orders and locked wallet coins before deletion', async () => {
    const prisma = {
      order: {
        findFirst: jest.fn().mockResolvedValue({ id: 'active-order-1' }),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      wallet: {
        findUnique: jest.fn().mockResolvedValue({ lockedBalance: 50, locked: false }),
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as unknown as Prisma.TransactionClient;

    const result = await checkActiveTransactionsForDeletion(prisma, {
      userId: 'user-123',
    });

    expect(result.hasActiveTransactions).toBe(true);
    expect(result.reasons).toContain('active customer orders in progress');
    expect(result.reasons).toContain(
      'locked wallet coins associated with ongoing transactions',
    );
  });

  it('passes when user has no in-flight transactions or locked coins', async () => {
    const prisma = {
      order: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      booking: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      wallet: {
        findUnique: jest.fn().mockResolvedValue({ lockedBalance: 0, locked: false }),
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    } as unknown as Prisma.TransactionClient;

    const result = await checkActiveTransactionsForDeletion(prisma, {
      userId: 'user-clean',
    });

    expect(result.hasActiveTransactions).toBe(false);
    expect(result.reasons.length).toBe(0);
  });
});
