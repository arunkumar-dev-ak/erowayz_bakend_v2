import { ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

export const extractUserIdFromRequest = (req: Request) => {
  const user = req['user'] as User | undefined;
  if (!user || !user.id) {
    throw new ForbiddenException('User not authorized');
  }
  return user.id;
};

export const extractUserFromRequest = (req: Request) => {
  const user = req['user'] as User | undefined;
  return user;
};
