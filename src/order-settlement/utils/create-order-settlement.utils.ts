import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateOrderSettlementDto } from '../dto/create-order-settlement';
import { VendorService } from 'src/vendor/vendor.service';
import { getDayRange } from 'src/common/functions/utils';
import { OrderSettlementService } from '../order-settlement.service';

export const CreateOrderSettlementUtils = async ({
  body,
  vendorService,
  orderSettlementService,
}: {
  body: CreateOrderSettlementDto;
  vendorService: VendorService;
  orderSettlementService: OrderSettlementService;
}) => {
  const { vendorId, date, amount, uploadedFileIds } = body;

  const [existingVendor, validFilesCount, existingOrderSettlement] =
    await Promise.all([
      vendorService.findVendorById({ id: vendorId }),
      orderSettlementService.findUploadedIdsCount(uploadedFileIds),
      orderSettlementService.getOrderSettlementByDateAndVendor({
        date,
        vendorId,
      }),
    ]);

  // ✅ Validate results
  if (!existingVendor) {
    throw new BadRequestException(`Vendor not found`);
  }

  if (validFilesCount !== uploadedFileIds.length) {
    throw new BadRequestException('Some of the Proof Images are invalid');
  }

  if (existingOrderSettlement) {
    throw new BadRequestException('Settlement already present on this date');
  }

  const { start } = getDayRange(date);

  const createQuery: Prisma.OrderSettlementCreateInput = {
    vendor: {
      connect: {
        id: vendorId,
      },
    },
    date: start,
    amount,
    ...(uploadedFileIds.length > 0 && {
      orderSettlementFile: {
        connect: uploadedFileIds.map((id) => ({ id })),
      },
    }),
  };

  return { createQuery };
};
