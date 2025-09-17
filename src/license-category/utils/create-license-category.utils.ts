import { BadRequestException } from '@nestjs/common';
import { CreateLicenseCategoryDto } from '../dto/create-license-category.dto';
import { LicenseCategoryService } from '../license-category.service';
import { Prisma } from '@prisma/client';

export const CreateLicenseCategoryUtils = async ({
  body,
  licenseCategoryService,
}: {
  body: CreateLicenseCategoryDto;
  licenseCategoryService: LicenseCategoryService;
}) => {
  const { name, status } = body;

  const existingLicenseCategory =
    await licenseCategoryService.getLicenseCategoryByName(name);
  if (existingLicenseCategory) {
    throw new BadRequestException(`Name already exists`);
  }

  const createQuery: Prisma.LicenseCategoryCreateInput = {
    name,
    status,
  };

  return { createQuery };
};
