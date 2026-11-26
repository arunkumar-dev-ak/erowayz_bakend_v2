import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, VendorCategoryType } from '@prisma/client';
import { RateVendorDto } from '../dto/rate-vendor.dto';

// Type for the Order fetched by the service
export type OrderWithItems = {
  id: string;
  orderId: string;
  userId: string;
  orderStatus: OrderStatus;
  orderItems: Array<{
    item?: {
      vendor?: {
        id: string;
        vendorType?: { type: VendorCategoryType } | null;
      } | null;
    } | null;
    orderItemVendorServiceOption?: Array<{
      vendorServiceOption?: {
        vendor?: {
          id: string;
          vendorType?: { type: VendorCategoryType } | null;
        } | null;
      } | null;
    }>;
  }>;
};

// Type for the Booking fetched by the service
export type BookingWithDetails = {
  id: string;
  bookedId: string;
  userId: string;
  bookingStatus: OrderStatus;
  bannerBooking?: {
    vendor?: {
      id: string;
      vendorType?: { type: VendorCategoryType } | null;
    } | null;
  } | null;
  serviceBooking?: Array<{
    vendorSubService?: {
      service?: {
        vendor?: {
          id: string;
          vendorType?: { type: VendorCategoryType } | null;
        } | null;
      } | null;
    } | null;
  }>;
};

// Type for the Existing Rating fetched by the service
export type ExistingVendorRating = {
  id?: string;
  userId?: string;
  vendorId?: string;
  orderId?: string | null;
  bookingId?: string | null;
  ratings?: Prisma.JsonValue | null;
  overallRating?: number | null;
  review?: string | null;
};

/*----- utils: verify target and extract vendorId & categoryType -----*/
export async function verifyTargetAndExtractVendor({
  body,
  userId,
  getOrderByOrderId,
  getBookingById,
}: {
  body: RateVendorDto;
  userId: string;
  getOrderByOrderId: (orderId: string) => Promise<OrderWithItems | null>;
  getBookingById: (bookingId: string) => Promise<BookingWithDetails | null>;
}): Promise<{ vendorId: string; categoryType: VendorCategoryType }> {
  if (body.orderId) {
    const order = await getOrderByOrderId(body.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You are not authorized to rate this order');
    }

    if (
      order.orderStatus !== OrderStatus.COMPLETED &&
      order.orderStatus !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'You can only rate vendors for completed or delivered orders',
      );
    }

    const vendor =
      order.orderItems[0]?.item?.vendor ||
      order.orderItems[0]?.orderItemVendorServiceOption?.[0]
        ?.vendorServiceOption?.vendor;

    if (!vendor || !vendor.vendorType?.type) {
      throw new BadRequestException('Unable to resolve vendor from this order');
    }

    return {
      vendorId: vendor.id,
      categoryType: vendor.vendorType.type,
    };
  }

  if (body.bookingId) {
    const booking = await getBookingById(body.bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to rate this booking',
      );
    }

    if (
      booking.bookingStatus !== OrderStatus.COMPLETED &&
      booking.bookingStatus !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'You can only rate vendors for completed or delivered bookings',
      );
    }

    const vendor =
      booking.bannerBooking?.vendor ||
      booking.serviceBooking?.[0]?.vendorSubService?.service?.vendor;

    if (!vendor || !vendor.vendorType?.type) {
      throw new BadRequestException(
        'Unable to resolve vendor from this booking',
      );
    }

    return {
      vendorId: vendor.id,
      categoryType: vendor.vendorType.type,
    };
  }

  throw new BadRequestException('Either orderId or bookingId must be provided');
}

/*----- utils: extract ratings & calculate overall -----*/
export function extractRatingsAndCalculateOverall({
  body,
  categoryType,
}: {
  body: RateVendorDto;
  categoryType: VendorCategoryType;
}): {
  selectedRatings?: Record<string, number>;
  calculatedOverallRating?: number;
} {
  const hasRatings =
    !!body.streetFoodRating || !!body.commonShopRating || !!body.serviceRating;

  let selectedRatings: Record<string, number> | undefined;
  let calculatedOverallRating: number | undefined;

  if (categoryType === VendorCategoryType.PRODUCT) {
    if (body.streetFoodRating) {
      selectedRatings = {
        hygiene: body.streetFoodRating.hygiene,
        hospitality: body.streetFoodRating.hospitality,
        speed: body.streetFoodRating.speed,
        foodTaste: body.streetFoodRating.foodTaste,
        valueForMoney: body.streetFoodRating.valueForMoney,
      };
    }
  } else if (categoryType === VendorCategoryType.BANNER) {
    if (body.commonShopRating) {
      selectedRatings = {
        productQuality: body.commonShopRating.productQuality,
        productAvailability: body.commonShopRating.productAvailability,
        vendorBehaviour: body.commonShopRating.vendorBehaviour,
        priceAndValue: body.commonShopRating.priceAndValue,
        customerService: body.commonShopRating.customerService,
      };
    }
  } else if (categoryType === VendorCategoryType.SERVICE) {
    if (body.serviceRating) {
      selectedRatings = {
        serviceQuality: body.serviceRating.serviceQuality,
        serviceSpeed: body.serviceRating.serviceSpeed,
        technicianBehaviour: body.serviceRating.technicianBehaviour,
        pricingAndValue: body.serviceRating.pricingAndValue,
        serviceReliability: body.serviceRating.serviceReliability,
      };
    }
  }

  if (hasRatings && !selectedRatings) {
    throw new BadRequestException(
      `Rating parameters provided do not match vendor category (${categoryType})`,
    );
  }

  if (selectedRatings) {
    const values = Object.values(selectedRatings);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    calculatedOverallRating = Number((sum / values.length).toFixed(1));
  }

  return { selectedRatings, calculatedOverallRating };
}

/*----- utils: build upsert query args -----*/
export function buildVendorRatingUpsertArgs({
  userId,
  vendorId,
  body,
  existingRating,
  selectedRatings,
  calculatedOverallRating,
}: {
  userId: string;
  vendorId: string;
  body: RateVendorDto;
  existingRating: ExistingVendorRating | null;
  selectedRatings?: Record<string, number>;
  calculatedOverallRating?: number;
}): Prisma.VendorRatingUpsertArgs {
  const finalRatings =
    selectedRatings ??
    (existingRating?.ratings as Prisma.InputJsonValue | undefined) ??
    Prisma.DbNull;

  const finalOverallRating =
    calculatedOverallRating ?? existingRating?.overallRating ?? null;

  const finalReview =
    body.review !== undefined
      ? body.review.trim() || null
      : (existingRating?.review ?? null);

  return {
    where: {
      userId_vendorId: {
        userId,
        vendorId,
      },
    },
    create: {
      userId,
      vendorId,
      orderId: body.orderId || null,
      bookingId: body.bookingId || null,
      ratings: finalRatings,
      overallRating: finalOverallRating,
      review: finalReview,
    },
    update: {
      orderId: body.orderId || existingRating?.orderId || null,
      bookingId: body.bookingId || existingRating?.bookingId || null,
      ratings: finalRatings,
      overallRating: finalOverallRating,
      review: finalReview,
      updatedAt: new Date(),
    },
  };
}
