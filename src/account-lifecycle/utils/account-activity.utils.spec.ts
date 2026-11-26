import { Prisma } from '@prisma/client';
import { checkPreservableAccountActivity } from './account-activity.utils';

describe('Account Activity Referral Safety', () => {
  it('detects historical referral rewards tied to retired codes after a vendor service-type switch', async () => {
    const tx = {
      wallet: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      retiredReferralCode: {
        findMany: jest.fn().mockResolvedValue([{ code: 'EROCMO001' }]),
      },
      order: { count: jest.fn().mockResolvedValue(0) },
      booking: { count: jest.fn().mockResolvedValue(0) },
      payment: { count: jest.fn().mockResolvedValue(0) },
      review: { count: jest.fn().mockResolvedValue(0) },
      vendorRating: { count: jest.fn().mockResolvedValue(0) },
      bloodRequest: { count: jest.fn().mockResolvedValue(0) },
      customerReport: { count: jest.fn().mockResolvedValue(0) },
      preDefinedBanner: { count: jest.fn().mockResolvedValue(0) },
      vendorType: { count: jest.fn().mockResolvedValue(0) },
      vendorSubscription: {
        count: jest.fn(({ where }) => {
          if (where.referralId?.in?.includes('EROCMO001')) {
            return Promise.resolve(1);
          }
          return Promise.resolve(0);
        }),
      },
      orderItem: { count: jest.fn().mockResolvedValue(0) },
      orderItemVendorServiceOption: { count: jest.fn().mockResolvedValue(0) },
      serviceBooking: { count: jest.fn().mockResolvedValue(0) },
      bannerBooking: { count: jest.fn().mockResolvedValue(0) },
      adminVendorCredit: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as Prisma.TransactionClient;

    const result = await checkPreservableAccountActivity(tx, {
      userId: 'vendor-user-1',
      vendorId: 'vendor-1',
      referralCode: 'EROSFV005',
    });

    expect(result.hasActivity).toBe(true);
    expect(result.reasons).toContain('referral reward records');
  });
});
