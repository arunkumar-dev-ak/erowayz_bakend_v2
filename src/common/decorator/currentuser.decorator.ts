import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Staff, User, Vendor } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: User & { vendor?: Vendor; staff?: Staff };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as User & { vendor?: Vendor; staff?: Staff };
  },
);
