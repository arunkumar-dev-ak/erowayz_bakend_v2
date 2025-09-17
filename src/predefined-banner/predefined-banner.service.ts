import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreatePredefinedBannerDto } from './dto/create-predefined.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MultipleFileUploadInterface } from 'src/vendor/vendor.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { UpdatePredefinedBannerDto } from './dto/update-predefined.dto';
import { ChangeStatusPredefinedBannerDto } from './dto/changestatus-predefined.dto';
import { Prisma } from '@prisma/client';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { GetBannerStatus } from './dto/predefined-banner-query.dto';
import { buildPreDefinedWhereFilter } from './function/getPredefineBanner-serviceHelper';

@Injectable()
export class PredefinedBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async getAllPredefinedBanner({
    res,
    name,
    status,
    offset,
    limit,
  }: {
    res: Response;
    name?: string;
    status?: GetBannerStatus;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    const where = buildPreDefinedWhereFilter({
      name,
      status,
    });

    const totalCount = await this.prisma.preDefinedBanner.count({ where });

    const predefinedBanners = await this.prisma.preDefinedBanner.findMany({
      where,
      skip: offset,
      take: limit,
    });

    const queries = buildQueryParams({
      status,
      name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'predefined-banner',
      queries,
    });

    return this.response.successResponse({
      res,
      data: predefinedBanners,
      meta,
      message: 'Predefined banners retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async extractPredefinedBannerById({
    res,
    bannerId,
  }: {
    res: Response;
    bannerId: string;
  }) {
    const initialDate = new Date();
    const predefinedBanner = await this.prisma.preDefinedBanner.findUnique({
      where: { id: bannerId },
    });

    if (!predefinedBanner) {
      throw new NotFoundException('Predefined banner not found');
    }

    return this.response.successResponse({
      res,
      data: predefinedBanner,
      message: 'Predefined banner retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createPredefinedBanner({
    res,
    userId,
    fgImage,
    bgImage,
    body,
  }: {
    res: Response;
    userId: string;
    fgImage?: Express.Multer.File;
    bgImage?: Express.Multer.File;
    body: CreatePredefinedBannerDto;
  }) {
    const initialDate = new Date();
    //unique name
    if (await this.getPredefinedBannerByName({ name: body.name })) {
      throw new BadRequestException('Predefined banner name must be unique');
    }

    //upload images
    const imageFiles = [fgImage, bgImage]
      .filter((file): file is Express.Multer.File => Boolean(file))
      .flat();

    if (imageFiles.length === 0) {
      throw new BadRequestException(
        'Please upload images for the predefined banner',
      );
    }

    const imageUrls: MultipleFileUploadInterface =
      this.fileUploadService.handleMultipleFileUpload({
        files: imageFiles,
        body: { type: ImageTypeEnum.BANNER },
      });

    const fgImageUrls = fgImage ? imageUrls.filePaths[0] : undefined;
    const bgImageUrls =
      bgImage && imageUrls.filePaths.length === 2
        ? imageUrls.filePaths[1]
        : bgImage
          ? imageUrls.filePaths[0]
          : undefined;

    try {
      const predefinedBanner = await this.prisma.preDefinedBanner.create({
        data: {
          name: body.name,
          description: body.description,
          title: body.title,
          subHeading: body.subHeading,
          offerType: body.offerType,
          offerValue: body.offerValue,
          minApplyValue: body.minApplyValue,
          userId,
          fgImageRef: fgImageUrls ? fgImageUrls.imageUrl : undefined,
          fgImageRelativeUrl: fgImageUrls
            ? fgImageUrls.relativePath
            : undefined,
          bgImageRef: bgImageUrls ? bgImageUrls.imageUrl : undefined,
          bgImageRelativeUrl: bgImageUrls
            ? bgImageUrls.relativePath
            : undefined,
          bgColor: body.bgColor,
          textColor: body.textColor,
        },
      });

      this.response.successResponse({
        res,
        data: predefinedBanner,
        message: 'Predefined banner created successfully',
        statusCode: 201,
        initialDate,
      });
    } catch (err) {
      for (const fileItem of imageUrls.filePaths) {
        this.fileUploadService.handleSingleFileDeletion(fileItem.relativePath);
      }
      throw err;
    }
  }

  async updatePredefinedBanner({
    res,
    bannerId,
    body,
    fgImage,
    bgImage,
  }: {
    res: Response;
    bannerId: string;
    body: UpdatePredefinedBannerDto;
    fgImage?: Express.Multer.File[] | null;
    bgImage?: Express.Multer.File[] | null;
  }) {
    const initialDate = new Date();
    const predefinedBanner = await this.getPredefinedBannerById(bannerId);
    if (!predefinedBanner) {
      throw new NotFoundException('Predefined banner not found');
    }

    if ((!body || Object.keys(body).length === 0) && !fgImage && !bgImage) {
      throw new BadRequestException('No valid fields were provided to update');
    }

    if (
      body.name?.trim() &&
      (await this.getPredefinedBannerByName({ name: body.name }))
    ) {
      throw new BadRequestException('Predefined banner name must be unique');
    }

    // Upload images if provided
    const imageFiles = [fgImage, bgImage]
      .filter((file): file is Express.Multer.File[] => Boolean(file))
      .flat();
    const imageUrls: MultipleFileUploadInterface | undefined = imageFiles.length
      ? this.fileUploadService.handleMultipleFileUpload({
          files: imageFiles,
          body: { type: ImageTypeEnum.BANNER },
        })
      : undefined;

    const fgImageUrls = fgImage ? imageUrls?.filePaths[0] : undefined;
    const bgImageUrls =
      bgImage && imageUrls?.filePaths.length === 2
        ? imageUrls.filePaths[1]
        : bgImage
          ? imageUrls?.filePaths[0]
          : undefined;

    const updateQuery: Prisma.PreDefinedBannerUpdateInput = {
      name: body.name?.trim() || undefined,
      description: body.description?.trim() || undefined,
      offerType: body.offerType || undefined,
      offerValue: body.offerValue || undefined,
      minApplyValue: body.minApplyValue || undefined,
      bgColor: body.bgColor?.trim() || undefined,
      textColor: body.textColor?.trim() || undefined,
      title: body.title || undefined,
      subHeading: body.subHeading || undefined,
    };

    if (fgImage) {
      updateQuery.fgImageRef = fgImageUrls?.imageUrl;
      updateQuery.fgImageRelativeUrl = fgImageUrls?.relativePath;
      updateQuery.bgImageRef = null;
      updateQuery.bgImageRelativeUrl = null;
    }

    if (bgImage) {
      updateQuery.bgImageRef = bgImageUrls?.imageUrl;
      updateQuery.bgImageRelativeUrl = bgImageUrls?.relativePath;
      updateQuery.fgImageRef = null;
      updateQuery.fgImageRelativeUrl = null;
    }

    try {
      const updatedItem = await this.prisma.preDefinedBanner.update({
        where: { id: bannerId },
        data: updateQuery,
      });

      //delete image
      if (fgImageUrls || bgImageUrls) {
        if (predefinedBanner.fgImageRelativeUrl) {
          this.fileUploadService.handleSingleFileDeletion(
            predefinedBanner.fgImageRelativeUrl,
          );
        }
        if (predefinedBanner.bgImageRelativeUrl) {
          this.fileUploadService.handleSingleFileDeletion(
            predefinedBanner.bgImageRelativeUrl,
          );
        }
      }

      this.response.successResponse({
        res,
        data: updatedItem,
        message: 'Predefined banner updated successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (imageUrls) {
        for (const fileItem of imageUrls.filePaths) {
          this.fileUploadService.handleSingleFileDeletion(
            fileItem.relativePath,
          );
        }
      }
      throw err;
    }
  }

  async changePredefinedBannerStatus({
    res,
    bannerId,
    body,
  }: {
    res: Response;
    bannerId: string;
    body: ChangeStatusPredefinedBannerDto;
  }) {
    const initialDate = new Date();
    const predefinedBanner = await this.getPredefinedBannerById(bannerId);
    if (!predefinedBanner) {
      throw new NotFoundException('Predefined banner not found');
    }

    const updatedBanner = await this.prisma.preDefinedBanner.update({
      where: { id: bannerId },
      data: { status: body.status },
    });

    this.response.successResponse({
      res,
      data: updatedBanner,
      message: 'Predefined banner status changed successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deletePredefinedBanner({
    res,
    bannerId,
  }: {
    res: Response;
    bannerId: string;
  }) {
    const initialDate = new Date();

    const predefinedBanner = await this.getPredefinedBannerById(bannerId);

    if (!predefinedBanner) {
      throw new NotFoundException('Predefined banner not found');
    }

    const deletedBanner = await this.prisma.preDefinedBanner.delete({
      where: { id: bannerId },
    });

    const imagePaths = [
      predefinedBanner.fgImageRelativeUrl,
      predefinedBanner.bgImageRelativeUrl,
    ].filter((path): path is string => Boolean(path));

    for (const path of imagePaths) {
      this.fileUploadService.handleSingleFileDeletion(path);
    }

    return this.response.successResponse({
      res,
      data: deletedBanner,
      message: 'Predefined banner deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getPredefinedBannerById(id: string) {
    const predefinedBanner = await this.prisma.preDefinedBanner.findUnique({
      where: { id },
    });
    return predefinedBanner;
  }

  async getPredefinedBannerByName({ name, id }: { name: string; id?: string }) {
    const predefinedBanner = await this.prisma.preDefinedBanner.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        ...(id ? { not: id } : {}),
      },
    });
    return predefinedBanner;
  }
}
