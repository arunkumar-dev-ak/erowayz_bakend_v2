import { Prisma, Role } from '@prisma/client';
import { GetServiceQueryDto } from '../dto/get-vendor-service-query.dto';

export function buildVendorServiceWhereFilter({
  query,
  userRole,
}: {
  query: GetServiceQueryDto;
  userRole?: Role;
}) {
  const { vendorId, name, status, keywordId } = query;

  const currentDate = new Date();

  const where: Prisma.ServiceWhereInput = {};

  if (vendorId) {
    where.vendorId = vendorId;
  }

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive',
    };
  }

  if (status) {
    where.status = status;
  }

  if (keywordId) {
    where.vendor = {
      serviceVendorKeyword: {
        some: {
          keywordId,
        },
      },
      ...(userRole !== 'VENDOR' && userRole !== 'STAFF'
        ? {
            vendorSubscription: {
              some: {
                endDate: {
                  gte: currentDate,
                },
                isActive: true,
              },
            },
          }
        : {}),
    };
  } else if (userRole !== 'VENDOR' && userRole !== 'STAFF') {
    // If keywordId is not provided, still apply subscription filter
    where.vendor = {
      vendorSubscription: {
        some: {
          endDate: {
            gte: currentDate,
          },
          isActive: true,
        },
      },
    };
  }

  return { where };
}
