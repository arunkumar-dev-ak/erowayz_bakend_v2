import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateBankPaymentTypeDto } from '../dto/update-bank-paymenttype.dto';
import { BankPaymenttypeService } from '../bank-paymenttype.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { ImageFiedlsInterface } from 'src/vendor/vendor.service';

export const UpdateBankPaymentTypeUtils = async ({
  body,
  bankPaymentTypeService,
  bankPaymentTypeId,
  file,
  fileUploadService,
}: {
  body: UpdateBankPaymentTypeDto;
  bankPaymentTypeService: BankPaymenttypeService;
  bankPaymentTypeId: string;
  file?: Express.Multer.File;
  fileUploadService: FileUploadService;
}) => {
  const { name, status, tamilName } = body;

  const existingPaymentType =
    await bankPaymentTypeService.getBankPaymentTypeById(bankPaymentTypeId);
  if (!existingPaymentType) {
    throw new BadRequestException('PaymentType not found');
  }

  if (name) {
    const existingPaymentType =
      await bankPaymentTypeService.getBankPaymentTypeByName(name);
    if (existingPaymentType && existingPaymentType.id !== bankPaymentTypeId) {
      throw new BadRequestException(`Name already exists`);
    }

    const bankPaymentTypeInShop =
      await bankPaymentTypeService.checkBankPaymentTypeHasShop(
        bankPaymentTypeId,
      );
    if (bankPaymentTypeInShop) {
      throw new BadRequestException(
        'Payment Type utilized by vendor.Cant update name',
      );
    }
  }

  let uploadedFile: ImageFiedlsInterface | null = null;

  if (file) {
    uploadedFile = fileUploadService.handleSingleFileUpload({
      file,
      body: { type: ImageTypeEnum.BANKPAYMENTTYPE },
    });
  }

  const updateQuery: Prisma.BankPaymentTypeUpdateInput = {};

  if (name !== undefined) {
    updateQuery.name = name;
  }

  if (tamilName !== undefined) {
    updateQuery.tamilName = tamilName;
  }

  if (status !== undefined) {
    updateQuery.status = status;
  }

  if (uploadedFile !== null) {
    updateQuery.image = uploadedFile.relativePath;
  }

  return { updateQuery, uploadedFile, existingPaymentType };
};
