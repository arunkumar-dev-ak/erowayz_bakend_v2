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

  const { vendorName, shopName, licenseStatus } = query;

  if (vendorName) {
    where.User = {
      name: { contains: vendorName, mode: 'insensitive' },
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
  };

  return include;
}
