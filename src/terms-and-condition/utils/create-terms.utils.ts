// utils/create-terms-and-condition.utils.ts
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from '@prisma/client';
import { CreateTermsAndConditionDto } from '../dto/create-terms-and-condition-policy.dto';

export async function validateCreateTermsAndCondition(
  prismaService: PrismaService,
  body: CreateTermsAndConditionDto,
) {
  // Validate vendor type exists if provided
  if (body.vendorTypeId) {
    const vendorType = await prismaService.vendorType.findUnique({
      where: { id: body.vendorTypeId },
    });

    if (!vendorType) {
      throw new BadRequestException('Vendor type not found');
    }
  }

  // Check if vendorTypeId is required for VENDOR user type
  if (body.userType === UserType.VENDOR && !body.vendorTypeId) {
    throw new BadRequestException(
      'vendorTypeId is required for VENDOR user type',
    );
  }

  // Check uniqueness - only one terms per vendorTypeId
  if (body.vendorTypeId) {
    const existingTerms = await prismaService.termsAndCondition.findFirst({
      where: { vendorTypeId: body.vendorTypeId },
    });

    if (existingTerms) {
      throw new BadRequestException(
        'Terms and conditions already exist for this vendor type',
      );
    }
  }

  // For CUSTOMER type, check if general terms already exist
  if (body.userType === UserType.CUSTOMER && !body.vendorTypeId) {
    const existingCustomerTerms =
      await prismaService.termsAndCondition.findFirst({
        where: {
          userType: UserType.CUSTOMER,
          vendorTypeId: null,
        },
      });

    if (existingCustomerTerms) {
      throw new BadRequestException(
        'General terms and conditions for customers already exist',
      );
    }
  }
}
