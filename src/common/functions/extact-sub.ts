import { VendorSubscription } from '@prisma/client';
import { Request } from 'express';

export const extractVendorSubFromRequest = (req: Request) => {
  const vendorSub = req['currentSubscription'] as
    | VendorSubscription
    | undefined;
  if (!vendorSub) {
    throw new Error('Subscription not found ');
  }
  return vendorSub;
};
