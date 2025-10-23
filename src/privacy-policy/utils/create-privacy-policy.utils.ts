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
}
