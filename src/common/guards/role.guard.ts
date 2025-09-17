import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, Staff, User, Vendor } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const user: User & { vendor?: Vendor } & { staff?: Staff } = request[
      'user'
    ] as User & {
      vendor?: Vendor;
    } & { staff?: Staff };

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    /*----- Handle Vendor Role -----*/
    if (user.role === Role.VENDOR && user.vendor) {
      request['vendorId'] = user.vendor.id;
    } else if (user.role === Role.STAFF && user.staff) {
      request['staffId'] = user.staff.id;
      request['vendorId'] = user.staff.vendorId;
    }

    return true;
  }
}
