// utils/update-privacy-policy.utils.ts
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePrivacyPolicyDto } from '../dto/update-privacy-policy.dto';
import { UserType } from '@prisma/client';

export async function validateUpdatePrivacyPolicy(
  prismaService: PrismaService,
  privacyPolicyId: string,
  body: UpdatePrivacyPolicyDto,
) {
  const privacyPolicy = await prismaService.privacyPolicy.findUnique({
    where: {
      id: privacyPolicyId,
    },
  });

  if (!privacyPolicy) {
    throw new BadRequestException('Privacy policy not found');
  }

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
  const finalUserType = body.userType || privacyPolicy.userType;
  if (
    finalUserType === UserType.VENDOR &&
    (!body.vendorTypeId || !privacyPolicy.vendorTypeId)
  ) {
    throw new BadRequestException('Vendor Type Is Required');
  }

  //check privacy policy with type
  if (body.type) {
    const existingCustomerPolicy = await prismaService.privacyPolicy.findFirst({
      where: {
        userType: UserType.CUSTOMER,
        type: body.type,
      },
    });

    if (
      existingCustomerPolicy &&
      existingCustomerPolicy.id !== privacyPolicy.id
    ) {
      throw new BadRequestException(
        `Privacy Policy already exists for ${body.type}`,
      );
    }
  }

  // Check uniqueness if vendorTypeId is being changed
  if (body.vendorTypeId) {
    const existingPolicy = await prismaService.privacyPolicy.findFirst({
      where: {
        vendorTypeId: body.vendorTypeId,
        id: { not: privacyPolicyId },
      },
    });

    if (existingPolicy) {
      throw new BadRequestException(
        'Privacy policy already exists for this vendor type',
      );
    }
  }
}
