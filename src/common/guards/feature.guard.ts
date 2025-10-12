import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Staff, User, Vendor, VendorSubscription } from '@prisma/client';

export interface ReqWithSubAndUser extends Request {
  user: User & { vendor?: Vendor } & { staff?: Staff };
  currentSubscription?: VendorSubscription;
}

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: ReqWithSubAndUser = context.switchToHttp().getRequest();

    const { currentSubscription } = request;

    // Get required features from custom decorator
    const requiredFeatures =
      this.reflector.get<string[]>('features', context.getHandler()) || [];

    // If no features required, allow
    if (requiredFeatures.length === 0) return true;

    if (!currentSubscription || !currentSubscription.planFeatures) {
      throw new ForbiddenException(
        'No active subscription or plan features found',
      );
    }

    // planFeatures is stored as JSON in DB, cast it
    const features = currentSubscription.planFeatures as Record<string, any>;

    // ✅ Allow if at least one required feature is enabled
    const hasAnyFeature = requiredFeatures.some(
      (feature) => features[feature] !== undefined && !!features[feature],
    );

    if (!hasAnyFeature) {
      throw new ForbiddenException(
        'You do not have permission to access this feature',
      );
    }

    return true;
  }
}
