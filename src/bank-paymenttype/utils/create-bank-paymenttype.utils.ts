import { BadRequestException } from '@nestjs/common';
import { CreateBankPaymentTypeDto } from '../dto/create-bank-paymenttype.dto';
import { Prisma } from '@prisma/client';
import { BankPaymenttypeService } from '../bank-paymenttype.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';

export const CreateBankPaymentTypeUtils = async ({
  body,
  bankPaymentTypeService,
  file,
  fileUploadService,
}: {
  body: CreateBankPaymentTypeDto;
  bankPaymentTypeService: BankPaymenttypeService;
  file: Express.Multer.File;
  fileUploadService: FileUploadService;
}) => {
  const { name, status } = body;

  const existingBankPaymentType =
    await bankPaymentTypeService.getBankPaymentTypeByName(name);
  if (existingBankPaymentType) {
    throw new BadRequestException(`Name already exists`);
  }

  const uploadedFile = fileUploadService.handleSingleFileUpload({
    file,
    body: { type: ImageTypeEnum.BANKPAYMENTTYPE },
  });

  const createQuery: Prisma.BankPaymentTypeCreateInput = {
    name,
    status,
    image: uploadedFile.relativePath,
  };

  return { createQuery, uploadedFile };
};
