import { Staff } from '@prisma/client';
import { Request } from 'express';

export const extractStaffIdFromRequest = (req: Request) => {
  const staff = req['staff'] as Staff | undefined;
  if (!staff) {
    throw new Error('Staff ID not found in request');
  }
  return staff.id;
};
