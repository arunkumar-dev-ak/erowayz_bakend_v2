import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Staff, User, Vendor } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: User & { staff?: Staff & { vendor: Vendor } };
}

export const CurrentStaff = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user.staff) {
      throw new BadRequestException('You do not have access to this resource.');
    }
    return request.user as User & { staff: Staff & { vendor: Vendor } };
  },
);
