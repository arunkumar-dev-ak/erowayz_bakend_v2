import {
  AccountStatus,
  ShopWorkingHour,
  VendorCategoryType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { VendorRatingSummary } from 'src/vendor-rating/utils/get-vendor-rating.utils';

export interface UnifiedVendorSource {
  id: string;
  vendorType: {
    id: string;
    name: string;
    type: VendorCategoryType;
  };
  shopInfo: {
    id: string;
    name: string;
    nameTamil: string | null;
    address: string;
    addressTamil: string | null;
    city: string;
    pincode: string;
    shopImageRef: string | null;
    relativeUrl: string | null;
    isShopOpen: boolean;
    latitude: number;
    longitude: number;
    license?: {
      isLicenseApproved: boolean;
      isKycConsentAccepted?: boolean;
      kycConsentAcceptedAt?: Date | null;
    } | null;
  } | null;
  vendorServiceOption: Array<{
    id: string;
    status: string;
    serviceOption?: {
      id: string;
      name: string;
      relativeUrl: string | null;
      serviceOptImageRef: string | null;
    } | null;
  }>;
  User?: {
    id: string;
    name: string;
    nameTamil: string | null;
    imageRef: string | null;
    relativeUrl: string | null;
    status: boolean;
    accountStatus?: AccountStatus;
  } | null;
  favouriteVendorForCustomer?: Array<{
    id: string;
  }>;
}

export interface CustomerExistingRatingSummary {
  id: string;
  overallRating: number | null;
  ratings: unknown;
  review: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/*----- utils: fetch unified vendor profile & basic info -----*/
export async function fetchUnifiedVendorProfile({
  vendorId,
  userId,
  prisma,
}: {
  vendorId: string;
  userId?: string;
  prisma: PrismaService;
}): Promise<UnifiedVendorSource | null> {
  const vendor = (await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      vendorType: true,
      shopInfo: {
        include: {
          license: true,
        },
      },
      vendorServiceOption: {
        where: { status: 'ACTIVE' },
        include: {
          serviceOption: true,
        },
      },
      User: {
        select: {
          id: true,
          name: true,
          nameTamil: true,
          imageRef: true,
          relativeUrl: true,
          status: true,
          accountStatus: true,
        },
      },
      ...(userId && {
        favouriteVendorForCustomer: {
          where: { userId },
          select: { id: true },
        },
      }),
    },
  })) as UnifiedVendorSource | null;

  if (
    !vendor ||
    !vendor.User ||
    vendor.User.status === false ||
    vendor.User.accountStatus !== AccountStatus.ACTIVE
  ) {
    return null;
  }

  return vendor;
}

/*----- utils: fetch shop timings -----*/
export async function fetchShopTimings({
  vendorId,
  prisma,
}: {
  vendorId: string;
  prisma: PrismaService;
}): Promise<ShopWorkingHour[]> {
  return await prisma.shopWorkingHour.findMany({
    where: {
      shop: { vendorId },
    },
    orderBy: {
      dayOfWeek: 'asc',
    },
  });
}

/*----- utils: fetch customer existing rating for vendor -----*/
export async function fetchCustomerExistingRating({
  prisma,
  userId,
  vendorId,
}: {
  prisma: PrismaService;
  userId: string;
  vendorId: string;
}): Promise<CustomerExistingRatingSummary | null> {
  return await prisma.vendorRating.findUnique({
    where: {
      userId_vendorId: {
        userId,
        vendorId,
      },
    },
    select: {
      id: true,
      overallRating: true,
      ratings: true,
      review: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/*----- utils: format unified vendor profile object -----*/
export function formatUnifiedVendorProfile({
  vendor,
  ratingSummary,
  shopTiming,
  userId,
}: {
  vendor: UnifiedVendorSource;
  ratingSummary: VendorRatingSummary;
  shopTiming: ShopWorkingHour[];
  userId?: string;
}) {
  const shopInfo = vendor.shopInfo;
  const user = vendor.User;
  const isVerified = Boolean(shopInfo?.license?.isLicenseApproved);
  const isFavourite = Boolean(
    userId && (vendor.favouriteVendorForCustomer?.length ?? 0) > 0,
  );

  const address = shopInfo
    ? [shopInfo.address, shopInfo.city, shopInfo.pincode]
        .filter(Boolean)
        .join(', ')
    : '';

  const serviceOptions = (vendor.vendorServiceOption || []).map((vso) => ({
    id: vso.serviceOption?.id || vso.id,
    name: vso.serviceOption?.name,
    relativeUrl: vso.serviceOption?.relativeUrl || null,
    serviceOptImageRef: vso.serviceOption?.serviceOptImageRef || null,
  }));

  // Exclude starCounts and cached flag from storefront rating summary
  const cleanRatingSummary = {
    overallRating: ratingSummary.overallRating,
    totalRatings: ratingSummary.totalRatings,
    categoryType: ratingSummary.categoryType,
    parameterAverages: ratingSummary.parameterAverages,
  };

  return {
    id: vendor.id,
    name: shopInfo?.name || user?.name || '',
    nameTamil: shopInfo?.nameTamil || user?.nameTamil || null,
    imageRef: shopInfo?.shopImageRef || user?.imageRef || null,
    relativeUrl: shopInfo?.relativeUrl || user?.relativeUrl || null,
    isOpen: Boolean(shopInfo?.isShopOpen),
    isVerified,
    isFavourite,
    address,
    addressTamil: shopInfo?.addressTamil || null,
    city: shopInfo?.city || null,
    pincode: shopInfo?.pincode || null,
    latitude: shopInfo?.latitude ?? null,
    longitude: shopInfo?.longitude ?? null,
    categoryType: vendor.vendorType.type,
    vendorType: {
      id: vendor.vendorType.id,
      name: vendor.vendorType.name,
      type: vendor.vendorType.type,
    },
    ratingSummary: cleanRatingSummary,
    serviceOptions,
    shopTiming,
  };
}
