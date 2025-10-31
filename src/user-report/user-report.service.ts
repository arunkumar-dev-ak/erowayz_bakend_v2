import { Injectable, NotFoundException } from '@nestjs/common';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { CreateUserReportUtils } from './utils/create-user-report.utils';
import { Response } from 'express';
import { UpdateUserReportDto } from './dto/update-user-report.dto';
import { UpdateUserReportUtils } from './utils/update-user-report.utils';
import { GetUserReportQueryDto } from './dto/get-user-report.dto';
import { buildUserReportWhereFilter } from './utils/get-user-report.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { UpdateUserReportStatusDto } from './dto/update-user-report-status.dto';

@Injectable()
export class UserReportService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getUserReport({
    res,
    query,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    query: GetUserReportQueryDto;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where = buildUserReportWhereFilter({
      query,
      userId,
    });

    const totalCount = await this.prismaService.userReport.count({
      where,
    });

    const platformFees = await this.prismaService.userReport.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            nameTamil: true,
          },
        },
        order: {
          select: {
            orderItems: {
              include: {
                item: {
                  include: {
                    vendor: {
                      include: {
                        User: {
                          select: {
                            name: true,
                            nameTamil: true,
                          },
                        },
                        shopInfo: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        booking: {
          include: {
            serviceBooking: {
              include: {
                vendorSubService: {
                  include: {
                    service: {
                      include: {
                        vendor: {
                          include: {
                            User: {
                              select: {
                                name: true,
                                nameTamil: true,
                              },
                            },
                            shopInfo: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            bannerBooking: {
              include: {
                vendor: {
                  include: {
                    User: {
                      select: {
                        name: true,
                        nameTamil: true,
                      },
                    },
                    shopInfo: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const queries = buildQueryParams({
      shopName: query.shopName,
      userName: query.userName,
      startDate: query.startDate?.toString(),
      endDate: query.endDate?.toString(),
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: userId ? 'user-report/user' : 'user-report/admin',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: platformFees,
      meta,
      message: 'User Report retrieved successfully',
      statusCode: 200,
    });
  }

  async createUserReport({
    body,
    res,
    userId,
    isVendor,
  }: {
    body: CreateUserReportDto;
    res: Response;
    userId: string;
    isVendor: boolean;
  }) {
    const initialDate = new Date();

    // Validation & Query Generation
    const { createQuery } = await CreateUserReportUtils({
      body,
      userReportService: this,
      userId,
      isVendor,
    });

    // Create the record
    const newReport = await this.prismaService.userReport.create({
      data: createQuery,
    });

    return this.responseService.successResponse({
      res,
      data: newReport,
      message: 'User report created successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateUserReport({
    body,
    res,
    userId,
    userReportId,
  }: {
    body: UpdateUserReportDto;
    res: Response;
    userId: string;
    userReportId: string;
  }) {
    const initialDate = new Date();

    // Validation & Query Generation
    const { updateQuery } = await UpdateUserReportUtils({
      body,
      userReportService: this,
      userId,
      userReportId,
    });

    // Update the record
    const updatedReport = await this.prismaService.userReport.update({
      where: { id: userReportId },
      data: updateQuery,
    });

    return this.responseService.successResponse({
      res,
      data: updatedReport,
      message: 'User report updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateUserReportStatus({
    body,
    res,
    userReportId,
  }: {
    body: UpdateUserReportStatusDto;
    res: Response;
    userReportId: string;
  }) {
    const initialDate = new Date();

    const userReport = await this.getUserReportById({
      id: userReportId,
    });

    if (!userReport) {
      throw new NotFoundException('User report not found');
    }

    // Update the record
    const updatedReport = await this.prismaService.userReport.update({
      where: { id: userReportId },
      data: {
        status: body.status,
      },
    });

    return this.responseService.successResponse({
      res,
      data: updatedReport,
      message: 'User report Status updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async getOrderById({ orderId }: { orderId: string }) {
    return await this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          take: 1,
          include: {
            item: {
              include: {
                vendor: {
                  include: {
                    User: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async checkBookingById({ bookingId }: { bookingId: string }) {
    return await this.prismaService.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        bannerBooking: {
          include: {
            vendor: {
              include: {
                User: true,
              },
            },
          },
        },
        serviceBooking: {
          include: {
            vendorSubService: {
              include: {
                service: {
                  include: {
                    vendor: {
                      include: {
                        User: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getUserReportById({ id }: { id: string }) {
    return await this.prismaService.userReport.findUnique({
      where: {
        id,
      },
    });
  }
}
