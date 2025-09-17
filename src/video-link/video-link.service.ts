import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class VideoLinkService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getVideoLink({ res }: { res: Response }) {
    const initialDate = new Date();

    const videoLinks = await this.prismaService.videoLink.findMany();

    return this.responseService.successResponse({
      initialDate,
      res,
      data: videoLinks,
      message: 'VideoLinks retrieved successfully',
      statusCode: 200,
    });
  }

  async createVideoLink({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const videoLink = await this.prismaService.videoLink.findFirst({});
    if (videoLink) {
      throw new BadRequestException('VideoLink already exists');
    }

    const newFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.VIDEOLINK,
      },
    });

    try {
      const newVideoLink = await this.prismaService.videoLink.create({
        data: {
          image: newFile.relativePath,
        },
      });

      return this.responseService.successResponse({
        res,
        data: newVideoLink,
        message: 'VideoLink Created Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(newFile.relativePath);
      throw err;
    }
  }

  async updateVideoLink({
    file,
    res,
  }: {
    file: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const videoLink = await this.prismaService.videoLink.findFirst({});
    if (!videoLink) {
      throw new BadRequestException('VideoLink Not Found');
    }

    const updatedFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.VIDEOLINK,
      },
    });

    try {
      const updatedVideoLink = await this.prismaService.videoLink.create({
        data: {
          image: updatedFile.relativePath,
        },
      });

      this.fileUploadService.handleSingleFileDeletion(videoLink.image);

      return this.responseService.successResponse({
        res,
        data: updatedVideoLink,
        message: 'VideoLink Updated Successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(updatedFile.relativePath);
      throw err;
    }
  }

  async deleteVideoLink({
    videoLinkId,
    res,
  }: {
    videoLinkId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const videoLink = await this.prismaService.videoLink.findFirst({});
    if (!videoLink) {
      throw new BadRequestException('VideoLink Not Found');
    }

    const deleteVideoLink = await this.prismaService.videoLink.delete({
      where: {
        id: videoLinkId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deleteVideoLink,
      message: 'VideoLink Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
