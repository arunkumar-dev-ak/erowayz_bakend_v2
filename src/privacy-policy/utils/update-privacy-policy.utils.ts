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
}
