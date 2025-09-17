import { BadRequestException, Injectable } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { Response } from 'express';
import { GetBloodDetailsQueryDto } from './dto/get-blood-details-query.dto';
import {
  buildBloodDetailsWhereFilter,
  includeBloodDetails,
} from './utils/get-bloodetails.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { RequestBloodDetailDto } from './dto/request-blood-details.dto';
import {
  checkDynamicFieldForBloodRequest,
  RequestBloodDetailsVerification,
} from './utils/request-blood-details.utils';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';

@Injectable()
export class BloodDetailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
  ) {}

  /*----- blood details -----*/
  async getBloodDetail({
    res,
    query,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    query: GetBloodDetailsQueryDto;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where = buildBloodDetailsWhereFilter({
      query,
    });

    const totalCount = await this.prisma.bloodDetails.count({ where });

    const bloodDetails = await this.prisma.bloodDetails.findMany({
      where,
      include: includeBloodDetails(userId),
      skip: offset,
      take: limit,
    });

    const queries = buildQueryParams({
      id: query.id,
      userName: query.userName,
      bloodGroup: query.bloodGroup,
      isDonor: 'true',
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'blood-details',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodDetails,
      meta,
      message: 'BloodDetails retrieved successfully',
      statusCode: 200,
    });
  }

  async updateDonorStatus({
    res,
    body,
    userId,
  }: {
    res: Response;
    body: UpdateDonorDto;
    userId: string;
  }) {
    const initialDate = new Date();

    const { isDonor } = body;

    const existingBloodDetails = await this.findBloodDetailsByUser(userId);
    if (!existingBloodDetails) {
      throw new BadRequestException(
        'None of the blood details found for this user',
      );
    }

    const bloodDetails = await this.prisma.bloodDetails.update({
      where: {
        id: existingBloodDetails.id,
      },
      data: {
        isDonor: TrueOrFalseMap[isDonor],
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodDetails,
      message: `Donor status change to ${isDonor} successfully`,
      statusCode: 200,
    });
  }

  async removeBloodDetail({ userId, res }: { userId: string; res: Response }) {
    const initialDate = new Date();

    const existingBloodDetails = await this.findBloodDetailsByUser(userId);
    if (!existingBloodDetails) {
      throw new BadRequestException(
        'None of the blood details found for this user',
      );
    }

    const bloodDetails = await this.prisma.bloodDetails.delete({
      where: {
        id: existingBloodDetails.id,
      },
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodDetails,
      message: `Blood Details deleted successfully`,
      statusCode: 200,
    });
  }

  /*----- Requesting blood details -----*/
  async requestBloodDetail({
    res,
    body,
    bloodDetailId,
    currentUserId,
  }: {
    res: Response;
    body: RequestBloodDetailDto;
    bloodDetailId: string;
    currentUserId: string;
  }) {
    const initialDate = new Date();
    const { patientName, hospitalName, patientMobileNumber } = body;

    //verification
    const { donorBloodDetail } = await RequestBloodDetailsVerification({
      bloodDetailService: this,
      currentUserId,
      bloodDetailId,
    });

    //validating dynamic field
    const { inputFields } = await checkDynamicFieldForBloodRequest({
      body,
      prisma: this.prisma,
    });

    // Create new blood request
    const bloodRequest = await this.prisma.bloodRequest.create({
      data: {
        userId: currentUserId,
        donorId: donorBloodDetail.userId,
        patientName,
        hospitalName,
        patientMobileNumber,
        dynamicFieldData: inputFields,
      },
    });

    // TODO: Add notification logic to notify the donor

    return this.response.successResponse({
      initialDate,
      res,
      data: bloodRequest,
      message: `Blood request sent successfully`,
      statusCode: 200,
    });
  }

  /*----- helper funcs -----*/
  async findBloodDetailsByUser(userId: string) {
    return await this.prisma.bloodDetails.findUnique({
      where: {
        userId,
      },
    });
  }

  async findBloodDetailById(id: string) {
    return await this.prisma.bloodDetails.findUnique({
      where: {
        id,
      },
      include: {
        User: true,
      },
    });
  }

  async findLastBloodDetails(requesterId: string, donorId: string) {
    return await this.prisma.bloodRequest.findFirst({
      where: {
        userId: requesterId,
        donorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBloodRequestById(bloodRequestId: string) {
    return await this.prisma.bloodRequest.findUnique({
      where: {
        id: bloodRequestId,
      },
    });
  }
}
