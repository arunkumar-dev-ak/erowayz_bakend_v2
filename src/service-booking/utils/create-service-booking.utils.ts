import { BadRequestException } from '@nestjs/common';
import { CreateServiceBookingDto } from '../dto/create-service-booking.dto';
import { VendorServiceService } from 'src/vendor-service/vendor-service.service';

export async function createServiceBookingUtils({
  vendorServiceService,
  body,
}: {
  vendorServiceService: VendorServiceService;
  body: CreateServiceBookingDto;
}) {
  const { latitude, longitude, vendorSubServiceId } = body;

  const vendorSubServices =
    await vendorServiceService.checkVendorSubServicesForBooking(
      vendorSubServiceId,
    );

  if (vendorSubServices.length !== vendorSubServiceId.length) {
    throw new BadRequestException(
      'Some Services are invalid or inactive.Please try after sometime',
    );
  }
  //check shop is open
  if (!vendorSubServices[0].service.vendor.shopInfo?.isShopOpen) {
    throw new BadRequestException(
      `Apologies for the reason.${vendorSubServices[0].service.vendor.shopInfo?.name} is currently closed`,
    );
  }

  //check all belongs to the same vendor
  const vendorIds = new Set(vendorSubServices.map((v) => v.service.vendorId));
  if (vendorIds.size > 1) {
    throw new BadRequestException(
      'All selected sub-services must belong to the same vendor. If you wish to book services from different vendors, please create separate orders for each.',
    );
  }

  const serviceBookingsData = vendorSubServices.map((v) => ({
    vendorSubService: {
      connect: { id: v.id },
    },
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    price: v.price,
  }));

  const vendorUserId: string = vendorSubServices[0].service.vendor.User.id;
  return { serviceBookingsData, vendorSubServices, vendorUserId };
}
