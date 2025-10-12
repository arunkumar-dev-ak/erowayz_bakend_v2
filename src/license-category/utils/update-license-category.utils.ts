import { BadRequestException } from '@nestjs/common';
import { UpdateLicenseCategoryDto } from '../dto/update-license-category.dto';
import { LicenseCategoryService } from '../license-category.service';
import { Prisma } from '@prisma/client';

export const UpdateLicenseCategoryUtils = async ({
  body,
  licenseCategoryService,
  licenseCategoryId,
}: {
  body: UpdateLicenseCategoryDto;
  licenseCategoryService: LicenseCategoryService;
  licenseCategoryId: string;
}) => {
  const { name, status, tamilName } = body;

  const existingLicenseCategory =
    await licenseCategoryService.getLicenseCategoryById(licenseCategoryId);
  if (!existingLicenseCategory) {
    throw new BadRequestException('LicenseCategory not found');
  }

  if (name) {
    const existingLicenseCategory =
      await licenseCategoryService.getLicenseCategoryByName(name);
    if (
      existingLicenseCategory &&
      existingLicenseCategory.id !== licenseCategoryId
    ) {
      throw new BadRequestException(`Name already exists`);
    }

    const licenseCategoryInLicense =
      await licenseCategoryService.checkLicenseCategoryHasLicense(
        licenseCategoryId,
      );
    if (licenseCategoryInLicense) {
      throw new BadRequestException(
        'License Category utilized by vendor.Cant update name',
      );
    }
  }

  const updateQuery: Prisma.LicenseCategoryUpdateInput = {};

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
