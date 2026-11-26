import { AccountStatus } from '@prisma/client';

export interface MaskableUserFields {
  id?: string;
  name?: string | null;
  nameTamil?: string | null;
  imageRef?: string | null;
  relativeUrl?: string | null;
  mobile?: string | null;
  email?: string | null;
  status?: boolean;
  accountStatus?: AccountStatus;
  [key: string]: unknown;
}

export function isUserInactiveForDeletion(
  user?: { status?: boolean; accountStatus?: AccountStatus } | null,
): boolean {
  if (!user) return false;
  return (
    user.accountStatus === AccountStatus.PENDING_DELETION ||
    user.accountStatus === AccountStatus.DELETED
  );
}

export function maskCustomerForVendorView<T extends MaskableUserFields>(
  customer: T | null | undefined,
): (T & { isDeletedCustomer?: boolean }) | null | undefined {
  if (!customer || !isUserInactiveForDeletion(customer)) {
    return customer;
  }

  const masked: Record<string, unknown> = {
    ...customer,
    name: 'Deleted Customer',
    nameTamil: null,
    imageRef: null,
    status: false,
    isDeletedCustomer: true,
  };

  if ('relativeUrl' in customer) {
    masked.relativeUrl = null;
  }
  if ('mobile' in customer) {
    masked.mobile = null;
  }
  if ('email' in customer) {
    masked.email = null;
  }
  if ('isTrustedCustomer' in customer) {
    masked.isTrustedCustomer = false;
  }
  if ('favouriteCustomerForVendor' in customer) {
    masked.favouriteCustomerForVendor = [];
  }

  return masked as T & { isDeletedCustomer?: boolean };
}

export function maskVendorForCustomerView<
  T extends {
    User?: MaskableUserFields | null;
    shopInfo?: Record<string, unknown> | null;
    [key: string]: unknown;
  },
>(
  vendor: T | null | undefined,
): (T & { isDeletedVendor?: boolean }) | null | undefined {
  if (!vendor || !isUserInactiveForDeletion(vendor.User)) {
    return vendor;
  }

  const maskedUser = vendor.User
    ? {
        ...vendor.User,
        name: 'Deleted Vendor',
        nameTamil: null,
        imageRef: null,
        status: false,
        ...('relativeUrl' in vendor.User ? { relativeUrl: null } : {}),
        ...('mobile' in vendor.User ? { mobile: null } : {}),
        ...('email' in vendor.User ? { email: null } : {}),
      }
    : vendor.User;

  const maskedShopInfo = vendor.shopInfo
    ? {
        ...vendor.shopInfo,
        name: 'Deleted Shop',
        nameTamil: null,
        shopImageRef: null,
        relativeUrl: null,
        address: 'Anonymized',
        addressTamil: null,
        isShopOpen: false,
      }
    : vendor.shopInfo;

  return {
    ...vendor,
    User: maskedUser,
    shopInfo: maskedShopInfo,
    isDeletedVendor: true,
  } as T & { isDeletedVendor?: boolean };
}
