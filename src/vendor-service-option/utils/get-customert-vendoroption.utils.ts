import { Prisma } from '@prisma/client';
import { GetVendorServiceQueryDto } from '../dto/get-vendor-service-query.dto';

export function buildCustomerVendorOptionWhereFilter({
  query,
}: {
  query: GetVendorServiceQueryDto;
}): Prisma.VendorServiceOptionWhereInput {
  const andFilters: Prisma.VendorServiceOptionWhereInput[] = [];

  const { serviceId, name, status, vendorId } = query;

  if (status) {
    andFilters.push({ status });
  }

  if (vendorId) {
    andFilters.push({
      vendorId,
    });
  }

  if (serviceId) {
    andFilters.push({
      serviceOption: {
        id: serviceId,
      },
    });
  }

  if (name) {
    andFilters.push({
      serviceOption: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  const where: Prisma.VendorServiceOptionWhereInput = {};

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  return where;
}
