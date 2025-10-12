import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { GetVideoQueryDto } from './dto/get-video-link.dto';
import { buildVideoLinkWhereFilter } from './utils/get-video-link.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';
import { CreateVideoLinkDto } from './dto/create-video-link.dto';
import { UpdateVideoLinkDto } from './dto/update-video-link.dto';

@Injectable()
export class VideoLinkService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getVideoLink({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetVideoQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildVideoLinkWhereFilter({
      query,
    });

    const totalCount = await this.prismaService.videoLink.count({
      where,
    });

    const citys = await this.prismaService.videoLink.findMany({
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
      path: 'video-link',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: citys,
      meta,
      message: 'Video Link retrieved successfully',
      statusCode: 200,
    });
  }

  async createVideoLink({
    res,
    body,
  }: {
    res: Response;
    body: CreateVideoLinkDto;
  }) {
    const initialDate = new Date();

    const { link, status, heading, tamilHeading } = body;

    const newVideoLink = await this.prismaService.videoLink.create({
      data: {
        link,
        status,
        heading,
        tamilHeading,
      },
    });

    return this.responseService.successResponse({
      res,
      data: newVideoLink,
      message: 'VideoLink Created Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateVideoLink({
    res,
    videoLinkId,
    body,
  }: {
    res: Response;
    videoLinkId: string;
    body: UpdateVideoLinkDto;
  }) {
    const initialDate = new Date();

    const videoLink = await this.prismaService.videoLink.findUnique({
      where: { id: videoLinkId },
    });
    if (!videoLink) {
      throw new BadRequestException('VideoLink Not Found');
    }

    const { link, status, heading, tamilHeading } = body;

    const updatedVideoLink = await this.prismaService.videoLink.update({
      where: {
        id: videoLinkId,
      },
      data: {
        ...(link && { link }),
        ...(status && { status }),
        ...(heading && { heading }),
        ...(tamilHeading && { tamilHeading }),
      },
    });

    return this.responseService.successResponse({
      res,
      data: updatedVideoLink,
      message: 'VideoLink Updated Successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteVideoLink({
    videoLinkId,
    res,
  }: {
    videoLinkId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const videoLink = await this.prismaService.videoLink.findUnique({
      where: { id: videoLinkId },
    });
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
