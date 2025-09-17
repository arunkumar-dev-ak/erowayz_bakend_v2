import { Prisma } from '@prisma/client';
import { GetServiceQueryDto } from '../dto/get-vendor-service-query.dto';

export function buildVendorServiceWhereFilter({
  query,
}: {
  query: GetServiceQueryDto;
}) {
  const { vendorId, name, status, keywordId } = query;

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
    };
  }

  return { where };
}
