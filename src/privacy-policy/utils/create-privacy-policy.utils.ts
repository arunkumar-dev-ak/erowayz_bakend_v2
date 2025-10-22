// utils/create-privacy-policy.utils.ts
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePrivacyPolicyDto } from '../dto/create-privacy-policy.dto';
import { UserType } from '@prisma/client';

export async function validateCreatePrivacyPolicy(
  prismaService: PrismaService,
  body: CreatePrivacyPolicyDto,
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

  // Check uniqueness - only one privacy policy per vendorTypeId
  if (body.vendorTypeId) {
    const existingPolicy = await prismaService.privacyPolicy.findFirst({
      where: { vendorTypeId: body.vendorTypeId },
    });

    if (existingPolicy) {
      throw new BadRequestException(
        'Privacy policy already exists for this vendor type',
      );
    }
  }

  if (body.userType === UserType.CUSTOMER && body.type) {
    const existingCustomerPolicy = await prismaService.privacyPolicy.findFirst({
      where: {
        userType: UserType.CUSTOMER,
        type: body.type,
      },
    });

    if (existingCustomerPolicy) {
      throw new BadRequestException(
        `Privacy Policy already exists for ${body.type}`,
      );
    }
  }

  if (body.userType === UserType.CUSTOMER && !body.vendorTypeId && !body.type) {
    // For CUSTOMER type, check if general privacy policy already exists
    const existingCustomerPolicy = await prismaService.privacyPolicy.findFirst({
      where: {
        userType: UserType.CUSTOMER,
        vendorTypeId: null,
      },
    });

    if (existingCustomerPolicy) {
      throw new BadRequestException(
        'General privacy policy for customers already exists',
      );
    }
  }
}
