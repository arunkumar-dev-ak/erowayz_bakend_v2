import { Request } from 'express';

export const extractVendorIdFromRequest = (
  req: Request,
  canThrowError: boolean = true,
) => {
  const vendorId = req['vendorId'] as string;
  if (!vendorId && canThrowError) {
    throw new Error('vendor ID not found ');
  }
  return vendorId;
};
