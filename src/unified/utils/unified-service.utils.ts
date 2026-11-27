import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  fetchMyLastCompletedBooking,
  MyLastBookingResult,
} from 'src/vendor-rating/utils/get-booking-vendor-rating.utils';

export { MyLastBookingResult };

/*----- utils: fetch active vendor service options -----*/
export async function fetchActiveVendorServiceOptions({
  vendorId,
  prisma,
}: {
  vendorId: string;
  prisma: PrismaService;
}) {
  return await prisma.serviceOption.findMany({
    where: {
      status: 'ACTIVE',
      service: {
        some: {
          vendorId,
          status: 'ACTIVE',
        },
      },
    },
    select: {
      id: true,
      name: true,
      tamilName: true,
      relativeUrl: true,
      serviceOptImageRef: true,
      description: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

/*----- utils: fetch paginated services with sub-services and images -----*/
export async function fetchPaginatedStoreServices({
  vendorId,
  offset,
  limit,
  serviceOptionId,
  prisma,
}: {
  vendorId: string;
  offset: number;
  limit: number;
  serviceOptionId?: string;
  prisma: PrismaService;
}) {
  const where: Prisma.ServiceWhereInput = {
    vendorId,
    status: 'ACTIVE',
    ...(serviceOptionId ? { serviceOptionId } : {}),
  };

  return await prisma.service.findMany({
    where,
    skip: offset,
    take: limit,
    include: {
      serviceImage: {
        select: {
          id: true,
          relativeUrl: true,
          absoluteUrl: true,
        },
      },
      serviceOption: {
        select: {
          id: true,
          name: true,
          tamilName: true,
        },
      },
      vendorSubService: {
        select: {
          id: true,
          name: true,
          price: true,
        },
        orderBy: {
          price: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/*----- utils: fetch total active services count -----*/
export async function fetchStoreServicesCount({
  vendorId,
  serviceOptionId,
  prisma,
}: {
  vendorId: string;
  serviceOptionId?: string;
  prisma: PrismaService;
}): Promise<number> {
  const where: Prisma.ServiceWhereInput = {
    vendorId,
    status: 'ACTIVE',
    ...(serviceOptionId ? { serviceOptionId } : {}),
  };

  return await prisma.service.count({ where });
}

/*----- utils: fetch customer's last completed booking (reused from rating utils) -----*/
export async function fetchLastCompletedBooking({
  vendorId,
  userId,
  prisma,
}: {
  vendorId: string;
  userId: string;
  prisma: PrismaService;
}): Promise<MyLastBookingResult | null> {
  return await fetchMyLastCompletedBooking({
    prisma,
    userId,
    vendorId,
  });
}
