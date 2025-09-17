import { BadRequestException } from '@nestjs/common';
import { LicenseCategoryService } from '../license-category.service';

export const DeleteLicenseCategoryUtils = async ({
  licenseCategoryId,
  licenseCategoryService,
}: {
  licenseCategoryId: string;
  licenseCategoryService: LicenseCategoryService;
}) => {
  const existingLicenseCategory =
    await licenseCategoryService.getLicenseCategoryById(licenseCategoryId);
  if (!existingLicenseCategory) {
    throw new BadRequestException('LicenseCategory not found');
  }

  const licenseCategoryWithLicense =
    await licenseCategoryService.checkLicenseCategoryHasLicense(
      licenseCategoryId,
    );
  if (licenseCategoryWithLicense) {
    throw new BadRequestException(
      'Vendor Utilized license category.You cannot delete',
    );
  }
};
