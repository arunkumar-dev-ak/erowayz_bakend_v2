import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class PrivacyPolicyService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getPrivacyPolicy({ res }: { res: Response }) {
    const initialDate = new Date();

    const privacyPolicys = await this.prismaService.privacyPolicy.findMany();

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
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const privacyPolicy = await this.prismaService.privacyPolicy.findFirst({});
    if (privacyPolicy) {
      throw new BadRequestException('PrivacyPolicy already exists');
    }

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
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const privacyPolicy = await this.prismaService.privacyPolicy.findFirst({});
    if (!privacyPolicy) {
      throw new BadRequestException('PrivacyPolicy Not Found');
    }

    const updatedFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.PRIVACYPOLICY,
      },
    });

    try {
      const updatedPrivacyPolicy =
        await this.prismaService.privacyPolicy.create({
          data: {
            image: updatedFile.relativePath,
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
      this.fileUploadService.handleSingleFileDeletion(updatedFile.relativePath);
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

    const privacyPolicy = await this.prismaService.privacyPolicy.findFirst({});
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
