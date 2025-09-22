import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition-policy.dto';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';

@Injectable()
export class TermsAndConditionService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getTermsAndCondition({ res }: { res: Response }) {
    const initialDate = new Date();

    const termsAndConditions =
      await this.prismaService.termsAndCondition.findMany();

    const count = await this.prismaService.termsAndCondition.count();

    const meta = this.metaDataService.createMetaData({
      totalCount: count,
      offset: 0,
      limit: 10,
      path: 'terms-and-condition',
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: termsAndConditions,
      message: 'TermsAndConditions retrieved successfully',
      statusCode: 200,
      meta,
    });
  }

  async createTermsAndCondition({
    file,
    res,
    body,
  }: {
    file: Express.Multer.File;
    res: Response;
    body: CreateTermsAndConditionDto;
  }) {
    const initialDate = new Date();

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
            userType: body.userType,
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
    body,
    termsId,
  }: {
    file: Express.Multer.File;
    res: Response;
    termsId: string;
    body: UpdateTermsAndConditionDto;
  }) {
    const initialDate = new Date();

    const termsAndCondition =
      await this.prismaService.termsAndCondition.findUnique({
        where: { id: termsId },
      });
    if (!termsAndCondition) {
      throw new BadRequestException('TermsAndCondition Not Found');
    }

    let updatedFile: {
      imageUrl: string;
      relativePath: string;
    } | null = null;
    if (file) {
      updatedFile = this.fileUploadService.handleSingleFileUpload({
        file,
        body: {
          type: ImageTypeEnum.TERMSANDCONDITION,
        },
      });
    }

    try {
      const newTermsAndCondition =
        await this.prismaService.termsAndCondition.update({
          where: {
            id: termsAndCondition.id,
          },
          data: {
            ...(updatedFile && { image: updatedFile.relativePath }),
            ...(body.userType && { userType: body.userType }),
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
      if (updatedFile) {
        this.fileUploadService.handleSingleFileDeletion(
          updatedFile.relativePath,
        );
      }
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
      await this.prismaService.termsAndCondition.findUnique({
        where: {
          id: termsAndConditionId,
        },
      });
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
