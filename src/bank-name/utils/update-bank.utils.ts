import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateBankNameDto } from '../dto/update-bank.dto';
import { BankNameNameService } from '../bank-name.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageFiedlsInterface } from 'src/vendor/vendor.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';

export const UpdateBankNameUtils = async ({
  body,
  bankNameService,
  bankNameId,
  file,
  fileUploadService,
}: {
  body: UpdateBankNameDto;
  bankNameService: BankNameNameService;
  bankNameId: string;
  file?: Express.Multer.File;
  fileUploadService: FileUploadService;
}) => {
  const { name, status, tamilName } = body;

  const existingBankName = await bankNameService.getBankNameById(bankNameId);
  if (!existingBankName) {
    throw new BadRequestException('BankName not found');
  }

  if (name) {
    const existingBankName = await bankNameService.getBankNameByName(name);
    if (existingBankName && existingBankName.id !== bankNameId) {
      throw new BadRequestException(`Name already exists`);
    }

    const bankNameInBankDetail =
      await bankNameService.checkBankNameHasBankDetail(bankNameId);
    if (bankNameInBankDetail) {
      throw new BadRequestException(
        'Bank Name utilized by vendor.Cant update name',
      );
    }
  }

  let uploadImage: ImageFiedlsInterface | null = null;

  if (file) {
    uploadImage = fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.BANKNAME,
      },
    });
  }

  const updateQuery: Prisma.BankNameUpdateInput = {};

  if (name !== undefined) {
    updateQuery.name = name;
  }

  if (tamilName !== undefined) {
    updateQuery.tamilName = tamilName;
  }

  if (status !== undefined) {
    updateQuery.status = status;
  }

  if (uploadImage) {
    updateQuery.image = uploadImage.relativePath;
  }

  return { updateQuery, uploadImage, existingBankName };
};
