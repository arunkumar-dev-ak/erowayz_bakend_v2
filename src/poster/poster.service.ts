// poster.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetPosterLinkQueryDto } from './dto/get-poster.dto';
import { buildPosterWhereFilter } from './utils/get-poster.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { Response } from 'express';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { CreatePosterDto } from './dto/create-poster.dto';
import { UpdatePosterDto } from './dto/update-poster.dto';
import { validateCreatePoster } from './utils/create-poster.utils';
import { validateUpdatePoster } from './utils/update-poster.utils';

@Injectable()
export class PosterService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getPoster({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetPosterLinkQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildPosterWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.poster.count({
      where,
    });

    const posters = await this.prismaService.poster.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        vendorType: true,
      },
    });

    const queries = buildQueryParams({
      heading: query.heading,
      userType: query.userType,
      vendorTypeId: query.vendorTypeId,
      vendorTypeName: query.vendorTypeName,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'poster',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: posters,
      meta,
      message: 'Posters retrieved successfully',
      statusCode: 200,
    });
  }

  async createPoster({
    file,
    res,
    body,
  }: {
    file: Express.Multer.File;
    res: Response;
    body: CreatePosterDto;
  }) {
    const initialDate = new Date();

    // Validate input and check constraints
    await validateCreatePoster(this.prismaService, body);

    const newFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.POSTER,
      },
    });

    const { heading, userType, vendorTypeId, status } = body;

    try {
      const newPoster = await this.prismaService.poster.create({
        data: {
          file: newFile.relativePath,
          heading,
          userType,
          vendorTypeId: vendorTypeId || null,
          status: status || 'ACTIVE',
        },
        include: {
          vendorType: true,
        },
      });

      return this.responseService.successResponse({
        res,
        data: newPoster,
        message: 'Poster created successfully',
        statusCode: 201,
        initialDate,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(newFile.relativePath);
      throw err;
    }
  }

  async updatePoster({
    file,
    res,
    body,
    posterId,
  }: {
    file?: Express.Multer.File;
    res: Response;
    posterId: string;
    body: UpdatePosterDto;
  }) {
    const initialDate = new Date();

    // Validate input and check constraints
    await validateUpdatePoster(this.prismaService, posterId, body);

    const poster = await this.prismaService.poster.findUnique({
      where: { id: posterId },
    });

    if (!poster) {
      throw new BadRequestException('Poster not found');
    }

    let updatedFile: {
      imageUrl: string;
      relativePath: string;
    } | null = null;

    if (file) {
      updatedFile = this.fileUploadService.handleSingleFileUpload({
        file,
        body: {
          type: ImageTypeEnum.POSTER,
        },
      });
    }

    const { heading, userType, vendorTypeId, status } = body;

    try {
      const updatedPoster = await this.prismaService.poster.update({
        where: {
          id: poster.id,
        },
        data: {
          ...(updatedFile && { file: updatedFile.relativePath }),
          ...(heading && { heading }),
          ...(userType && { userType }),
          ...(vendorTypeId !== undefined && { vendorTypeId }),
          ...(status && { status }),
        },
        include: {
          vendorType: true,
        },
      });

      // Delete old file if new file was uploaded
      if (updatedFile && poster.file) {
        this.fileUploadService.handleSingleFileDeletion(poster.file);
      }

      return this.responseService.successResponse({
        res,
        data: updatedPoster,
        message: 'Poster updated successfully',
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

  async deletePoster({ posterId, res }: { posterId: string; res: Response }) {
    const initialDate = new Date();

    const poster = await this.prismaService.poster.findUnique({
      where: {
        id: posterId,
      },
    });

    if (!poster) {
      throw new BadRequestException('Poster not found');
    }

    const deletedPoster = await this.prismaService.poster.delete({
      where: {
        id: posterId,
      },
    });

    // Delete associated file
    if (poster.file) {
      this.fileUploadService.handleSingleFileDeletion(poster.file);
    }

    return this.responseService.successResponse({
      res,
      data: deletedPoster,
      message: 'Poster deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
