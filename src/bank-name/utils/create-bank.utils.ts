import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateBankNameDto } from '../dto/create-bank.dto';
import { BankNameNameService } from '../bank-name.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';

export const CreateBankNameUtils = async ({
  body,
  bankNameService,
  file,
  fileUploadService,
}: {
  body: CreateBankNameDto;
  bankNameService: BankNameNameService;
  file: Express.Multer.File;
  fileUploadService: FileUploadService;
}) => {
  const { name, status, tamilName } = body;

  const existingBankName = await bankNameService.getBankNameByName(name);
  if (existingBankName) {
    throw new BadRequestException(`Name already exists`);
  }

  const uploadedImage = fileUploadService.handleSingleFileUpload({
    file,
    body: {
      type: ImageTypeEnum.BANKNAME,
    },
  });

  const createQuery: Prisma.BankNameCreateInput = {
    name,
    status,
    tamilName,
    image: uploadedImage.relativePath,
  };

  return { createQuery, uploadedImage };
};
