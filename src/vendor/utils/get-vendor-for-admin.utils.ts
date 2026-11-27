import { Prisma } from '@prisma/client';
import {
  ApprovedOrPendingMap,
  GetVendorQueryForAdminDto,
} from '../dto/get-vendor-admin-query.dto';

export function buildVendorForAdminWhereFilter({
  query,
}: {
  query: GetVendorQueryForAdminDto;
}) {
  const where: Prisma.VendorWhereInput = {};

  const { vendorName, shopName, licenseStatus, mobile, isBankVerified } = query;

  if (vendorName || mobile) {
    where.User = {
      ...(vendorName && {
        name: { contains: vendorName, mode: 'insensitive' },
      }),
      ...(mobile && { mobile: { contains: mobile, mode: 'insensitive' } }),
    };
  }

  if (shopName || licenseStatus) {
    where.shopInfo = {
      ...(shopName
        ? { name: { contains: shopName, mode: 'insensitive' } }
        : {}),
      ...(licenseStatus
        ? {
            license: { isLicenseApproved: ApprovedOrPendingMap[licenseStatus] },
          }
        : {}),
    };
  }

  if (isBankVerified) {
    where.bankDetail = {
      isVerified: ApprovedOrPendingMap[isBankVerified],
    };
  }

  return where;
}

export function getIncludeVendorUtilsForAdmin(): Prisma.VendorInclude {
  const include: Prisma.VendorInclude = {
    User: {
      select: {
        id: true,
        mobile: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        imageRef: true,
        name: true,
        nameTamil: true,
        status: true,
        referralCode: true,
        referees: {
          select: {
            id: true,
            mobile: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            imageRef: true,
            name: true,
            nameTamil: true,
            status: true,
            referralCode: true,
          },
        },
        referrer: {
          select: {
            id: true,
            mobile: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            imageRef: true,
            name: true,
            nameTamil: true,
            status: true,
            referralCode: true,
          },
        },
      },
    },
    vendorServiceOption: {
      include: {
        serviceOption: true,
      },
    },
    vendorType: true,
    shopInfo: {
      include: {
        license: true,
        shopCategory: true,
        shopCity: true,
      },
    },
    bankDetail: {
      include: {
        bankNameRel: true,
        bankPaymentRel: true,
      },
    },
  };

  return include;
}
