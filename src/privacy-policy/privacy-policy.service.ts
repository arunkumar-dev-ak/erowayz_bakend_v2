import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';
import { MetadataService } from 'src/metadata/metadata.service';

@Injectable()
export class PrivacyPolicyService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getPrivacyPolicy({ res }: { res: Response }) {
    const initialDate = new Date();

    const privacyPolicys = await this.prismaService.privacyPolicy.findMany();

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
      data: privacyPolicys,
      message: 'TermsAndConditions retrieved successfully',
      statusCode: 200,
      meta,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: privacyPolicys,
      message: 'PrivacyPolicys retrieved successfully',
      statusCode: 200,
    });
  }

  async createPrivacyPolicy({
    file,
    res,
    body,
  }: {
    file: Express.Multer.File;
    res: Response;
    body: CreatePrivacyPolicyDto;
  }) {
    const initialDate = new Date();

    const newFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.PRIVACYPOLICY,
      },
    });

    try {
      const newPrivacyPolicy = await this.prismaService.privacyPolicy.create({
        data: {
          image: newFile.relativePath,
          userType: body.userType,
        },
      });

      return this.responseService.successResponse({
        res,
        data: newPrivacyPolicy,
        message: 'PrivacyPolicy Created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(newFile.relativePath);
      throw err;
    }
  }

  async updatePrivacyPolicy({
    file,
    res,
    body,
    privacyPolicyId,
  }: {
    file?: Express.Multer.File;
    res: Response;
    body: UpdatePrivacyPolicyDto;
    privacyPolicyId: string;
  }) {
    const initialDate = new Date();

    const privacyPolicy = await this.prismaService.privacyPolicy.findUnique({
      where: { id: privacyPolicyId },
    });
    if (!privacyPolicy) {
      throw new BadRequestException('PrivacyPolicy Not Found');
    }

    let updatedFile: {
      imageUrl: string;
      relativePath: string;
    } | null = null;
    if (file) {
      updatedFile = this.fileUploadService.handleSingleFileUpload({
        file,
        body: {
          type: ImageTypeEnum.PRIVACYPOLICY,
        },
      });
    }

    try {
      const updatedPrivacyPolicy =
        await this.prismaService.privacyPolicy.update({
          where: {
            id: privacyPolicy.id,
          },
          data: {
            ...(updatedFile && { image: updatedFile.relativePath }),
            ...(body.userType && { userType: body.userType }),
          },
        });

      this.fileUploadService.handleSingleFileDeletion(privacyPolicy.image);

      return this.responseService.successResponse({
        res,
        data: updatedPrivacyPolicy,
        message: 'PrivacyPolicy Updated Successfully',
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

  async deletePrivacyPolicy({
    privacyPolicyId,
    res,
  }: {
    privacyPolicyId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const privacyPolicy = await this.prismaService.privacyPolicy.findUnique({
      where: { id: privacyPolicyId },
    });
    if (!privacyPolicy) {
      throw new BadRequestException('PrivacyPolicy Not Found');
    }

    const deletePrivacyPolicy = await this.prismaService.privacyPolicy.delete({
      where: {
        id: privacyPolicyId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deletePrivacyPolicy,
      message: 'PrivacyPolicy Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
