import { BadRequestException } from '@nestjs/common';
import { ProductUnitService } from '../product-unit.service';

export const DeleteProductUnitUtils = async ({
  productUnitId,
  productUnitService,
}: {
  productUnitId: string;
  productUnitService: ProductUnitService;
}) => {
  const existingProductUnit =
    await productUnitService.getProductUnitById(productUnitId);
  if (!existingProductUnit) {
    throw new BadRequestException('ProductUnit not found');
  }

  const productUnitWithItem =
    await productUnitService.checkProductUnitHasItem(productUnitId);
  if (productUnitWithItem) {
    throw new BadRequestException(
      'Vendor Utilized item category.You cannot delete',
    );
  }
};
