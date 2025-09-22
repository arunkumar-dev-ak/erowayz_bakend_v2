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

    const citys = await this.prismaService.poster.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const queries = buildQueryParams({
      heading: query.heading,
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
      data: citys,
      meta,
      message: 'Poster retrieved successfully',
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

    const newFile = this.fileUploadService.handleSingleFileUpload({
      file,
      body: {
        type: ImageTypeEnum.POSTER,
      },
    });

    const { heading, status } = body;

    try {
      const newPoster = await this.prismaService.poster.create({
        data: {
          file: newFile.relativePath,
          status,
          heading,
        },
      });

      return this.responseService.successResponse({
        res,
        data: newPoster,
        message: 'Poster Created Successfully',
        statusCode: 200,
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
    file: Express.Multer.File;
    res: Response;
    posterId: string;
    body: UpdatePosterDto;
  }) {
    const initialDate = new Date();

    const poster = await this.prismaService.poster.findUnique({
      where: { id: posterId },
    });
    if (!poster) {
      throw new BadRequestException('Poster Not Found');
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

    const { heading, status } = body;

    try {
      const newPoster = await this.prismaService.poster.update({
        where: {
          id: poster.id,
        },
        data: {
          ...(updatedFile && { file: updatedFile.relativePath }),
          ...(heading && { heading }),
          ...(status && { status }),
        },
      });

      return this.responseService.successResponse({
        res,
        data: newPoster,
        message: 'Poster Created Successfully',
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
      throw new BadRequestException('Poster Not Found');
    }

    const deletePoster = await this.prismaService.poster.delete({
      where: {
        id: posterId,
      },
    });

    return this.responseService.successResponse({
      res,
      data: deletePoster,
      message: 'Poster Deleted Successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
