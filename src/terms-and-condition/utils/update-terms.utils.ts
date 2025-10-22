import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTermsAndConditionDto } from '../dto/update-terms-and-condition.dto';
import { UserType } from '@prisma/client';

export async function validateUpdateTermsAndCondition(
  prismaService: PrismaService,
  termsId: string,
  body: UpdateTermsAndConditionDto,
) {
  const terms = await prismaService.termsAndCondition.findUnique({
    where: {
      id: termsId,
    },
  });
  if (!terms) {
    throw new BadRequestException('Terms and condition not found');
  }

  const finalUserType = body.userType || terms.userType;
  if (
    finalUserType === UserType.VENDOR &&
    (!body.vendorTypeId || !terms.vendorTypeId)
  ) {
    throw new BadRequestException('Vendor Type Is Required');
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

  if (body.type) {
    const existingCustomerPolicy =
      await prismaService.termsAndCondition.findFirst({
        where: {
          userType: UserType.CUSTOMER,
          type: body.type,
        },
      });

    if (existingCustomerPolicy && existingCustomerPolicy.id !== terms.id) {
      throw new BadRequestException(
        `Terms and condition already exists for ${body.type}`,
      );
    }
  }

  if (body.vendorTypeId) {
    // Check uniqueness if vendorTypeId is being changed
    const existingTerms = await prismaService.termsAndCondition.findFirst({
      where: {
        vendorTypeId: body.vendorTypeId,
        id: { not: termsId },
      },
    });

    if (existingTerms) {
      throw new BadRequestException(
        'Terms and conditions already exist for this vendor type',
      );
    }
  }
}
