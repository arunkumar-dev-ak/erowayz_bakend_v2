import { BadRequestException } from '@nestjs/common';
import { CreateProductUnitDto } from '../dto/create-product-unit.dto';
import { Prisma } from '@prisma/client';
import { ProductUnitService } from '../product-unit.service';

export const CreateProductUnitUtils = async ({
  body,
  productUnitService,
}: {
  body: CreateProductUnitDto;
  productUnitService: ProductUnitService;
}) => {
  const { name, status } = body;

  const existingProductUnit =
    await productUnitService.getProductUnitByName(name);
  if (existingProductUnit) {
    throw new BadRequestException(`Name already exists`);
  }

  const createQuery: Prisma.ProductUnitCreateInput = {
    name,
    status,
  };

  return { createQuery };
};
