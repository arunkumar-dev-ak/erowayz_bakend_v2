import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VendorTypeService } from '../vendor-type.service';
import { UpdateVendorTypeDto } from '../dto/updatevendortype.dto';
import { VendorCategoryType } from '@prisma/client';

export async function updateVendorTypeUtils({
  vendorTypeService,
  body,
  id,
}: {
  vendorTypeService: VendorTypeService;
  body: UpdateVendorTypeDto;
  id: string;
}) {
  const { name, type } = body;

  const existingVendorType = await vendorTypeService.findVendorTypeById(id);
  if (!existingVendorType) {
    throw new NotFoundException('Vendor Type not found');
  }

  // Check if another vendor type exists with the same name
  if (name && (await vendorTypeService.findVendorTypeByName(name, id))) {
    throw new BadRequestException('Vendor name must be unique');
  }

  // Check for conflicting updates
  if (
    type &&
    type === VendorCategoryType.SERVICE &&
    existingVendorType.category.length > 0
  ) {
    throw new BadRequestException(
      'Cannot update to SERVICE because vendor type has existing categories',
    );
  }

  //vendor has subservices
  if (
    type &&
    type === VendorCategoryType.PRODUCT &&
    existingVendorType.vendor
  ) {
    throw new BadRequestException(
      'Cannot update to PRODUCT because vendor type has sub-services in service options',
    );
  }

  return { existingVendorType };
}
