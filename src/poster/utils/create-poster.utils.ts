// utils/create-poster.utils.ts
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePosterDto } from '../dto/create-poster.dto';
import { UserType } from '@prisma/client';

export async function validateCreatePoster(
  prismaService: PrismaService,
  body: CreatePosterDto,
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

  // For CUSTOMER type, vendorTypeId should not be provided
  if (body.userType === UserType.CUSTOMER && body.vendorTypeId) {
    throw new BadRequestException(
      'vendorTypeId should not be provided for CUSTOMER user type',
    );
  }
}
