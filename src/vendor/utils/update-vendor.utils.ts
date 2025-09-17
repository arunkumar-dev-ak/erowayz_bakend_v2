import { Prisma, Status, VendorType } from '@prisma/client';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { KeywordService } from 'src/keyword/keyword.service';
import { UserService } from 'src/user/user.service';
import { VendorService } from '../vendor.service';

export interface ImageFiedlsInterface {
  imageUrl: string;
  relativePath: string;
}

export const buildVendorUpdateInput = ({
  body,
  uploadedImage,
}: {
  body: UpdateVendorDto;
  uploadedImage?: ImageFiedlsInterface;
}): Prisma.VendorUpdateInput => {
  const vendorUpdateInput: Prisma.VendorUpdateInput = {};
  const { name, paymentMethod, email, nameTamil } = body;

  if (name !== undefined || uploadedImage || email) {
    vendorUpdateInput.User = {
      update: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(nameTamil !== undefined && { nameTamil }),
        ...(uploadedImage && {
          imageRef: uploadedImage.imageUrl,
          relativeUrl: uploadedImage.relativePath,
        }),
      },
    };
  }

  if (paymentMethod) {
    vendorUpdateInput.paymentMethod = paymentMethod;
  }

  return vendorUpdateInput;
};

export const UpdateVendorVerification = async ({
  body,
  vendorType,
  vendorTypeService,
  keywordService,
  userService,
  vendorService,
  userId,
  vendorId,
}: {
  body: UpdateVendorDto;
  vendorType: VendorType;
  vendorTypeService: VendorTypeService;
  keywordService: KeywordService;
  userService: UserService;
  vendorService: VendorService;
  userId: string;
  vendorId: string;
}) => {
  const { serviceOptionIds, keyWordIds } = body;

  let inactivateQuery: Prisma.VendorServiceOptionUpdateManyArgs | null = null;
  let activateQuery: Prisma.VendorServiceOptionUpdateManyArgs | null = null;
  let createQuery: Prisma.VendorServiceOptionCreateManyArgs | null = null;

  //check service options
  if (serviceOptionIds) {
    if (vendorType.type === 'BANNER') {
      throw new ConflictException(
        `You can't create an service options for ${vendorType.name}`,
      );
    }

    const serviceOptions = await vendorTypeService.findServiceCountOnVendorType(
      {
        serviceOptionIds,
        vendorTypeId: vendorType.id,
      },
    );
    if (serviceOptionIds.length !== serviceOptions) {
      throw new BadRequestException('Some of the serviceOptions are invalid');
    }

    //vendor service option logic
    const existingVendorServiceOptions =
      await vendorService.getVendorServiceOptionByVendor(vendorId);

    const existingMap = new Map<string, Status>();

    for (const option of existingVendorServiceOptions) {
      existingMap.set(option.serviceOptionId, option.status);
    }

    const toActivate: string[] = [];
    const toCreate: string[] = [];
    const toInactivate: string[] = [];

    //to create and activate
    for (const id of serviceOptionIds) {
      if (!existingMap.has(id)) {
        toCreate.push(id);
      } else if (existingMap.get(id) === 'INACTIVE') {
        toActivate.push(id);
      }
    }

    //to inactivate
    for (const [id, status] of existingMap.entries()) {
      if (!serviceOptionIds.includes(id) && status === 'ACTIVE') {
        toInactivate.push(id);
      }
    }

    inactivateQuery =
      toInactivate.length > 0
        ? {
            where: {
              vendorId: vendorId,
              serviceOptionId: { in: toInactivate },
            },
            data: { status: 'INACTIVE' },
          }
        : null;

    activateQuery =
      toActivate.length > 0
        ? {
            where: {
              vendorId: vendorId,
              serviceOptionId: { in: toActivate },
            },
            data: { status: 'ACTIVE' },
          }
        : null;

    createQuery =
      toCreate.length > 0
        ? {
            data: toCreate.map((id) => ({
              vendorId: vendorId,
              serviceOptionId: id,
              status: 'ACTIVE',
            })),
            skipDuplicates: true,
          }
        : null;
  }
  //check keywords
  if (keyWordIds) {
    if (vendorType.type !== 'SERVICE') {
      throw new BadRequestException(
        `You can't give the keywords for ${vendorType.name}`,
      );
    }
    //validate keywords
    const keyWords = await keywordService.checkKeyWordCountForRegistration(
      keyWordIds,
      vendorType.id,
    );
    if (keyWordIds.length !== keyWords) {
      throw new BadRequestException('Some of the keywords are invalid');
    }
  }

  //check email
  if (body.email) {
    await userService.checkUserByEmailForAccount(body.email, userId);
  }

  return { activateQuery, inactivateQuery, createQuery };
};
