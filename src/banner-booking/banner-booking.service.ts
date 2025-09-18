import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateBannerBookingDto } from './dto/create-banner-booking.dto';
import { BannerService } from 'src/banner/banner.service';
import { createBookingId } from 'src/service-booking/utils/service-booking.utils';
import { ChangeBannerBookingStatusDto } from './dto/banner-booking-status.dto';
import {
  Booking,
  OrderStatus,
  Prisma,
  Staff,
  User,
  Vendor,
} from '@prisma/client';
import {
  checkValidStatus,
  extractUserAndVendorId,
} from 'src/order/utils/order.utils';
import { GetBannerBookingQueryDto } from './dto/get-banner-booking-query.dto';
import {
  buildCustomerBannerBookingWhereFilter,
  buildVendorBannerBookingWhereFilter,
} from './utils/banner-booking-utils.dto';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { BannerBookingGateway } from './banner-booking.gateway';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { getNotificationContentForBannerBookingStatus } from './utils/update-banner-booking-status.utils';

@Injectable()
export class BannerBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly bannerService: BannerService,
    private readonly bannnerBookingGateway: BannerBookingGateway,
    private readonly firebaseNotificationService: FirebaseNotificationService,
  ) {}

  statusFlowMap: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['DELIVERED', 'COMPLETED'],
    COMPLETED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  /*----Get call ----*/
  async getBannerBookingForUser({
    res,
    query,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    query: GetBannerBookingQueryDto;
    offset: number;
    limit: number;
    userId: string;
  }) {
    const initialDate = new Date();

    const where: Prisma.BookingWhereInput =
      buildCustomerBannerBookingWhereFilter({
        userId,
        query,
      });

    const totalCount = await this.prisma.booking.count({ where });

    const orders = await this.prisma.booking.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bannerBooking: {
          include: {
            vendor: {
              include: {
                shopInfo: {
                  include: {
                    shopCategory: true,
                    shopCity: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const queries = buildQueryParams({
      userId,
      startDate: query.startDate,
      endDate: query.endDate,
      bookedId: query.bookedId,
      orderStatus: query.orderStatus,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'service-booking/customer',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: orders,
      meta,
      message: 'Booking retrieved successfully',
      statusCode: 200,
    });
  }

  async getBannerBookingForVendor({
    vendorId,
    res,
    query,
    offset,
    limit,
  }: {
    vendorId: string;
    res: Response;
    query: GetBannerBookingQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where: Prisma.BookingWhereInput = buildVendorBannerBookingWhereFilter(
      {
        vendorId,
        query,
      },
    );

    const totalCount = await this.prisma.booking.count({ where });

    const orders = await this.prisma.booking.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bannerBooking: {
          include: {
            vendor: {
              include: {
                shopInfo: {
                  include: {
                    shopCategory: true,
                    shopCity: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const queries = buildQueryParams({
      vendorId,
      startDate: query.startDate,
      endDate: query.endDate,
      bookedId: query.bookedId,
      orderStatus: query.orderStatus,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'banner-booking/vendor',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: orders,
      meta,
      message: 'Banner retrieved successfully',
      statusCode: 200,
    });
  }

  async getBannerBookingById({
    res,
    bookingId,
    userId,
    vendorId,
  }: {
    res: Response;
    bookingId: string;
    userId?: string;
    vendorId?: string;
  }) {
    const initialDate = new Date();

    //where clause
    const where: Prisma.BookingWhereInput = {
      id: bookingId,
      serviceBooking: {
        some: {},
      },
    };
    if (!userId || !vendorId) {
      throw new BadRequestException(
        'You dont have permission to access this route',
      );
    } else if (vendorId) {
      where.serviceBooking = {
        some: {
          vendorSubService: {
            service: {
              vendorId,
            },
          },
        },
      };
    } else {
      where.userId = userId;
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where,
      include: {
        bannerBooking: true,
      },
    });

    if (!existingBooking) {
      throw new BadRequestException(
        `Booking not found or not associated with the User`,
      );
    }

    return this.response.successResponse({
      initialDate,
      res,
      data: existingBooking,
      message: 'Booking fetched successfully',
      statusCode: 200,
    });
  }

  /*----- create ----*/
  async createBannerBooking({
    res,
    body,
    userId,
  }: {
    res: Response;
    body: CreateBannerBookingDto;
    userId: string;
  }) {
    const initialDate = new Date();
    const { bannerId, arrivalDateTime } = body;

    const banner = await this.bannerService.findBannerForBooking(bannerId);

    if (!banner) {
      throw new BadRequestException(
        'Aplogies for the reason, Banner is not found',
      );
    } else if (banner.bannerType !== 'REGULAR') {
      throw new BadRequestException(
        `Apologies for the reaon, You can't book the ${banner.name}.Try after sometime`,
      );
    } else if (
      banner.startDateTime > arrivalDateTime ||
      banner.endDateTime < arrivalDateTime
    ) {
      throw new BadRequestException(
        `Aplogies for the reason.Unfortunately your arrival time is not valid for that banner`,
      );
    }

    const bookedId = await createBookingId(this.prisma);

    const booking = await this.prisma.booking.create({
      data: {
        bookedId,
        userId,
        bannerBooking: {
          create: {
            bannerId: banner.id,
            vendorId: banner.vendor.id,
            arrivalTime: arrivalDateTime,
            bannerName: banner.name,
            offerType: banner.offerType,
            offerValue: banner.offerValue,
            minApplyValue: banner.minApplyValue,
            startDateTime: banner.startDateTime,
            endDateTime: banner.endDateTime,
            bgImageRef: banner.bgImageRef,
            fgImageRef: banner.fgImageRef,
          },
        },
      },
      include: {
        bannerBooking: {
          include: {
            vendor: true,
          },
        },
        bookedUser: {
          select: {
            name: true,
            nameTamil: true,
          },
        },
      },
    });

    if (booking.bannerBooking?.vendor.userId) {
      await this.bannnerBookingGateway.notifyUser(
        booking.bannerBooking?.vendor.userId,
        'bannerBookingStatus',
        booking,
      );
    }

    const vendorUserId = banner.vendor.userId;

    //sending notification
    await this.firebaseNotificationService.sendNotificationToAllSession({
      receiverId: vendorUserId,
      isReceiverVendor: true,
      title: '🛒 New Booking Received!',
      content: `You’ve received a new Booking from ${booking.bookedUser.name}. Tap to view booking #${booking.bookedId}.`,
      vendorType: 'BANNER',
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: booking,
      statusCode: 200,
      message: 'Booking done successfully',
    });
  }

  async changeStatus({
    res,
    body,
    currentUser,
    bookingId,
  }: {
    res: Response;
    body: ChangeBannerBookingStatusDto;
    currentUser: User & { vendor?: Vendor; staff?: Staff };
    bookingId: string;
  }) {
    const { userId, vendorId } = extractUserAndVendorId(currentUser);

    const initialDate = new Date();
    //check booking by Id
    const existingBooking = await this.findBannerBookingById(
      bookingId,
      userId,
      vendorId,
    );
    if (!existingBooking) {
      throw new BadRequestException(
        'Booking not found or not associated with user',
      );
    }

    const newStatus = body.orderStatus;
    const currentStatus = existingBooking.bookingStatus;
    //check whether the status is crt
    checkValidStatus({
      userRole: currentUser.role,
      currentStatus,
      newStatus,
      statusFlowMap: this.statusFlowMap,
    });

    let updatedBooking: Booking | null = null;
    if (newStatus === 'CANCELLED') {
      updatedBooking = await this.handleBannerServiceCancelBooking({
        declinedReason: body.declinedReason,
        bookingId,
        userId,
      });
    } else {
      updatedBooking = await this.prisma.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          bookingStatus: body.orderStatus,
        },
        include: {
          bannerBooking: true,
        },
      });
    }

    //notify in real time
    if (vendorId) {
      await this.bannnerBookingGateway.notifyUser(
        updatedBooking.userId,
        'bannerBookingStatus',
        updatedBooking,
      );
    } else {
      await this.bannnerBookingGateway.notifyUser(
        userId,
        'bannerBookingStatus',
        updatedBooking,
      );
    }

    //sending notitifcation
    const notificationContent = getNotificationContentForBannerBookingStatus({
      userId: currentUser.id,
      updatedBooking: existingBooking,
      status: updatedBooking.bookingStatus,
    });

    if (notificationContent) {
      await this.firebaseNotificationService.sendNotificationToAllSession({
        title: notificationContent.title,
        content: notificationContent.content,
        receiverId: notificationContent.receiverId,
        isReceiverVendor: notificationContent.isReceiverVendor,
        vendorType: 'BANNER',
      });
    }

    return this.response.successResponse({
      initialDate,
      data: updatedBooking,
      message: `Booking of ${existingBooking.bookedId} is changed to ${newStatus} successfully`,
      res,
      statusCode: 200,
    });
  }

  /*----- hepler func ----*/
  async findBannerBookingById(
    bookingId: string,
    userId: string,
    vendorId?: string,
  ) {
    const where: Prisma.BookingWhereInput = {
      id: bookingId,
    };

    if (vendorId) {
      where.bannerBooking = {
        vendorId,
      };
    } else {
      where.userId = userId;
    }

    const booking = await this.prisma.booking.findFirst({
      where,
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
      },
    });

    return booking;
  }

  async handleBannerServiceCancelBooking({
    declinedReason,
    bookingId,
    userId,
  }: {
    declinedReason: string;
    bookingId: string;
    userId: string;
  }) {
    const updatedBooking = await this.prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        bookingStatus: 'CANCELLED',
        declinedReason,
        declinedUser: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return updatedBooking;
  }
}
