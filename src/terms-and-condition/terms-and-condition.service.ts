import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class TermsAndConditionService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getTermsAndCondition({ res }: { res: Response }) {
    const initialDate = new Date();

    const termsAndConditions =
      await this.prismaService.termsAndCondition.findMany();

    return this.responseService.successResponse({
      initialDate,
      res,
      data: termsAndConditions,
      message: 'TermsAndConditions retrieved successfully',
      statusCode: 200,
    });
  }

  async createTermsAndCondition({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const termsAndCondition =
      await this.prismaService.termsAndCondition.findFirst({});
    if (termsAndCondition) {
      throw new BadRequestException('TermsAndCondition already exists');
    }

    const newFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.TERMSANDCONDITION,
      },
    });

    try {
      const newTermsAndCondition =
        await this.prismaService.termsAndCondition.create({
          data: {
            image: newFile.relativePath,
          },
        });

      return this.responseService.successResponse({
        res,
        data: newTermsAndCondition,
        message: 'TermsAndCondition Created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(newFile.relativePath);
      throw err;
    }
  }

  async updateTermsAndCondition({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const termsAndCondition =
      await this.prismaService.termsAndCondition.findFirst({});
    if (!termsAndCondition) {
      throw new BadRequestException('TermsAndCondition Not Found');
    }

    const updatedFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.TERMSANDCONDITION,
      },
    });

    try {
      const updatedTermsAndCondition =
        await this.prismaService.termsAndCondition.create({
          data: {
            image: updatedFile.relativePath,
          },
        });

      this.fileUploadService.handleSingleFileDeletion(termsAndCondition.image);

      return this.responseService.successResponse({
        res,
        data: updatedTermsAndCondition,
        message: 'TermsAndCondition Updated Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(updatedFile.relativePath);
      throw err;
    }
  }

  async deleteTermsAndCondition({
    termsAndConditionId,
    res,
  }: {
    termsAndConditionId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const termsAndCondition =
      await this.prismaService.termsAndCondition.findFirst({});
    if (!termsAndCondition) {
      throw new BadRequestException('TermsAndCondition Not Found');
    }

    const deleteTermsAndCondition =
      await this.prismaService.termsAndCondition.delete({
        where: {
          id: termsAndConditionId,
        },
      });

    return this.responseService.successResponse({
      res,
      data: deleteTermsAndCondition,
      message: 'TermsAndCondition Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
