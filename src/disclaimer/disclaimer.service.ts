import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class DisclaimerService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getDisclaimer({ res }: { res: Response }) {
    const initialDate = new Date();

    const disclaimers = await this.prismaService.disclaimer.findMany();

    return this.responseService.successResponse({
      initialDate,
      res,
      data: disclaimers,
      message: 'Disclaimers retrieved successfully',
      statusCode: 200,
    });
  }

  async createDisclaimer({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const disclaimer = await this.prismaService.disclaimer.findFirst({});
    if (disclaimer) {
      throw new BadRequestException('Disclaimer already exists');
    }

    const newFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.DISCLAIMER,
      },
    });

    try {
      const newDisclaimer = await this.prismaService.disclaimer.create({
        data: {
          image: newFile.relativePath,
        },
      });

      return this.responseService.successResponse({
        res,
        data: newDisclaimer,
        message: 'Disclaimer Created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(newFile.relativePath);
      throw err;
    }
  }

  async updateDisclaimer({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const disclaimer = await this.prismaService.disclaimer.findFirst({});
    if (!disclaimer) {
      throw new BadRequestException('Disclaimer Not Found');
    }

    const updatedFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.DISCLAIMER,
      },
    });

    try {
      const updatedDisclaimer = await this.prismaService.disclaimer.create({
        data: {
          image: updatedFile.relativePath,
        },
      });

      this.fileUploadService.handleSingleFileDeletion(disclaimer.image);

      return this.responseService.successResponse({
        res,
        data: updatedDisclaimer,
        message: 'Disclaimer Updated Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(updatedFile.relativePath);
      throw err;
    }
  }

  async deleteDisclaimer({
    disclaimerId,
    res,
  }: {
    disclaimerId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const disclaimer = await this.prismaService.disclaimer.findFirst({});
    if (!disclaimer) {
      throw new BadRequestException('Disclaimer Not Found');
    }

    const deleteDisclaimer = await this.prismaService.disclaimer.delete({
      where: {
        id: disclaimerId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deleteDisclaimer,
      message: 'Disclaimer Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
