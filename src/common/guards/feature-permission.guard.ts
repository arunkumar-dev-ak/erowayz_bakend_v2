import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorator/featurepermission.decorator';
import { Staff, User, Vendor, VendorSubscription } from '@prisma/client';
import { Request } from 'express';

export interface PlanFeatures {
  openCloseStatus?: boolean;
  productStatusChangeLimit?: number | 'unlimited';
  stockEditable?: boolean;
  qtyUpdateLimit?: number | 'unlimited';
  paymentModes?: string[];
  coinsLimitations?: number | 'unlimited';
  locationChangeLimit?: number | 'unlimited';
  staffAccountLimit?: number | 'unlimited';
  dineOptions?: string[];
  customerSupport?: boolean;
  banner?: boolean;
  socialMeduiaPromotion?: boolean;
  tracking?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  [key: string]: any;
}

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) return true;

    const request: Request = context.switchToHttp().getRequest();

    const user = request['user'] as User & {
      vendor?: Vendor & {
        vendorSubscription: VendorSubscription[];
      };
      staff?: Staff & {
        vendor: Vendor & {
          vendorSubscription: VendorSubscription[];
        };
      };
    };

    const rawPlanFeatures =
      user?.vendor?.vendorSubscription?.[0]?.planFeatures ??
      user?.staff?.vendor?.vendorSubscription?.[0]?.planFeatures;

    const planFeatures = rawPlanFeatures as PlanFeatures | undefined;

    console.log(user?.vendor);

    if (!planFeatures || !(requiredFeature in planFeatures)) {
      throw new ForbiddenException(
        `Missing feature permission: ${requiredFeature}`,
      );
    }

    const featureValue = planFeatures[requiredFeature] as unknown;

    if (this.isValidFeatureValue(featureValue)) return true;

    throw new ForbiddenException(
      `Access denied: feature ${requiredFeature} is not enabled.`,
    );
  }

  private isValidFeatureValue(
    val: unknown,
  ): val is string[] | number | 'unlimited' | boolean {
    console.log(`val === true is  ${val === true}`);
    // console.log(`val === unlimited is  ${val === 'unlimited'}`);
    // console.log(
    //   `(Array.isArray(val) && val.length > 0) is  ${Array.isArray(val) && val.length > 0}`,
    // );
    // console.log(
    //   `(typeof val === 'number' && val > 0 is  ${typeof val === 'number' && val > 0}`,
    // );
    return (
      val === true ||
      val === 'unlimited' ||
      (typeof val === 'number' && val > 0) ||
      (Array.isArray(val) && val.length > 0)
    );
  }
}
