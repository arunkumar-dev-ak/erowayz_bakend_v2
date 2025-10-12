import { BadRequestException } from '@nestjs/common';
import { UpdateProductUnitDto } from '../dto/update-product-unit.dto';
import { Prisma } from '@prisma/client';
import { ProductUnitService } from '../product-unit.service';

export const UpdateProductUnitUtils = async ({
  body,
  productUnitService,
  productUnitId,
}: {
  body: UpdateProductUnitDto;
  productUnitService: ProductUnitService;
  productUnitId: string;
}) => {
  const { name, status, tamilName } = body;

  const existingProductUnit =
    await productUnitService.getProductUnitById(productUnitId);
  if (!existingProductUnit) {
    throw new BadRequestException('ProductUnit not found');
  }

  if (name) {
    const existingProductUnit =
      await productUnitService.getProductUnitByName(name);
    if (existingProductUnit && existingProductUnit.id !== productUnitId) {
      throw new BadRequestException(`Name already exists`);
    }

    const productUnitInItem =
      await productUnitService.checkProductUnitHasItem(productUnitId);
    if (productUnitInItem) {
      throw new BadRequestException(
        'Item Category utilized by vendor.Cant update name',
      );
    }
  }

  const updateQuery: Prisma.ProductUnitUpdateInput = {};

  if (name !== undefined) {
    updateQuery.name = name;
  }

  if (tamilName !== undefined) {
    updateQuery.tamilName = tamilName;
  }

  if (status !== undefined) {
    updateQuery.status = status;
  }

  return { updateQuery };
};
