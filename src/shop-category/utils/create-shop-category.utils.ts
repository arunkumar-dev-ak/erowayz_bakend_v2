import { BadRequestException } from '@nestjs/common';
import { CreateShopCategoryDto } from '../dto/create-shop-category.dto';
import { Prisma } from '@prisma/client';
import { ShopCategoryService } from '../shop-category.service';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';

export const CreateShopCategoryUtils = async ({
  body,
  shopCategoryService,
  vendorTypeService,
}: {
  body: CreateShopCategoryDto;
  shopCategoryService: ShopCategoryService;
  vendorTypeService: VendorTypeService;
}) => {
  const { name, status, vendorTypeId, tamilName } = body;

  const vendorType = await vendorTypeService.findVendorTypeById(vendorTypeId);
  if (!vendorType) {
    throw new BadRequestException('Vendor type not found');
  }

  const existingShopCategory = await shopCategoryService.getShopCategoryByName(
    name,
    vendorTypeId,
  );
  if (existingShopCategory) {
    throw new BadRequestException(`Name already exists`);
  }

  const createQuery: Prisma.ShopCategoryCreateInput = {
    name,
    status,
    vendorType: {
      connect: {
        id: vendorTypeId,
      },
    },
    tamilName,
  };

  return { createQuery };
};
