import { User } from '@prisma/client';
import { Request } from 'express';

export const extractAdminIdFromRequest = (req: Request) => {
  const admin = req['user'] as User | undefined;
  if (!admin) {
    throw new Error('Admin ID not found ');
  }
  return admin.id;
};
