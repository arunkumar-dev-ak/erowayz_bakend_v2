import { BadRequestException } from '@nestjs/common';
import { updateKeyWordDto } from '../dto/update-keyword.dto';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { keyWord, ServiceVendorKeyword } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const KeyWordUpdateUtils = async ({
  body,
  vendorTypeService,
  existingKeyWord,
  keyWordId,
  prisma,
}: {
  body: updateKeyWordDto;
  vendorTypeService: VendorTypeService;
  existingKeyWord: keyWord & { serviceVendorKeyword?: ServiceVendorKeyword[] };
  keyWordId: string;
  prisma: PrismaService;
}) => {
  const { vendorTypeId, keyWordType, name } = body;

  //check vendorType
  if (
    vendorTypeId &&
    !(await vendorTypeService.findVendorTypeById(vendorTypeId))
  ) {
    throw new BadRequestException('VendorType not exists');
  }

  //check vendor using this
  if (
    existingKeyWord.serviceVendorKeyword &&
    existingKeyWord.serviceVendorKeyword.length > 0 &&
    (vendorTypeId || keyWordType)
  ) {
    throw new BadRequestException(
      'This keyword is in use by a vendor, so you cannot update its VendorType or KeyWordType. Delete it if changes are needed.',
    );
  }

  //check for unique name
  const existingNameKeyWord = await prisma.keyWord.findFirst({
    where: {
      vendorTypeId,
      name,
      keyWordType,
      ...(keyWordId && { id: keyWordId }),
    },
  });
  if (existingNameKeyWord && existingKeyWord.id !== keyWordId) {
    throw new BadRequestException(`${name} already exists for this vendorType`);
  }
};
