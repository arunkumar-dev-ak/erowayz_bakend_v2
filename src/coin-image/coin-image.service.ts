import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class CoinImageService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getCoinImage({ res }: { res: Response }) {
    const initialDate = new Date();

    const coinImage = await this.checkCoinImage();

    return this.responseService.successResponse({
      res,
      data: coinImage,
      message: 'Coin Image retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createCoinImage({
    image,
    res,
  }: {
    image: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    // 🔹 Check if an existing coin image already exists
    const currentImage = await this.checkCoinImage();

    // 🔹 Upload new image
    const uploadedImage = this.fileUploadService.handleSingleFileUpload({
      file: image,
      body: { type: ImageTypeEnum.COIN_IMAGE },
    });

    try {
      // 🔹 Upsert the coin image record
      const coinsImage = await this.prismaService.coinImage.upsert({
        where: {
          id: currentImage?.id ?? '', // if no existing image, fallback to empty string
        },
        update: {
          image: uploadedImage.relativePath,
        },
        create: {
          image: uploadedImage.relativePath,
        },
      });

      // 🔹 Delete old image if replaced
      if (
        currentImage?.image &&
        currentImage.image !== uploadedImage.relativePath
      ) {
        this.fileUploadService.handleSingleFileDeletion(currentImage.image);
      }

      return this.responseService.successResponse({
        initialDate,
        res,
        message: 'Coin image uploaded successfully',
        data: coinsImage,
        statusCode: 200,
      });
    } catch (err) {
      // 🔹 Delete newly uploaded image if DB operation fails
      if (uploadedImage?.relativePath) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadedImage.relativePath,
        );
      }
      throw err;
    }
  }

  /*----- helper func -----*/
  async checkCoinImage() {
    return await this.prismaService.coinImage.findFirst({});
  }
}
