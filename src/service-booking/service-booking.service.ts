import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import { createBookingId } from './utils/service-booking.utils';
import { ChangeBookingStatusDto } from './dto/service-booking-status.dto';
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
import { GetServiceBookingQueryDto } from './dto/get-service-booking-query.dto';
import {
  buildCustomerServiceBookingWhereFilter,
  buildVendorServiceBookingWhereFilter,
} from './utils/service-booking-where-filter';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';
import { ServiceBookingGateway } from './service-booking.gateway';
import { createServiceBookingUtils } from './utils/create-service-booking.utils';
import { VendorServiceService } from 'src/vendor-service/vendor-service.service';
import { FirebaseNotificationService } from 'src/firebase/firebase.notification.service';
import { getNotificationContentForServiceBookingStatus } from './utils/update-service-booking-status.utils';
import { GetAdminServiceBookingQueryDto } from './dto/service-booking-admin.dto';
import { buildAdminServiceBookingWhereFilter } from './utils/get-admin-aervice-booking.utils';

@Injectable()
export class ServiceBookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly serviceBookingGateway: ServiceBookingGateway,
    private readonly vendorServiceService: VendorServiceService,
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
  async getServiceBookingForUser({
    userId,
    res,
    query,
    offset,
    limit,
  }: {
    userId: string;
    res: Response;
    query: GetServiceBookingQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where: Prisma.BookingWhereInput =
      buildCustomerServiceBookingWhereFilter({
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
        serviceBooking: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            vendorSubService: {
              include: {
                service: {
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

  async getServiceBookingForVendor({
    vendorId,
    res,
    query,
    offset,
    limit,
  }: {
    vendorId: string;
    res: Response;
    query: GetServiceBookingQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where: Prisma.BookingWhereInput =
      buildVendorServiceBookingWhereFilter({
        vendorId,
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
        serviceBooking: {
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            vendorSubService: {
              include: {
                service: {
                  include: {
                    serviceOption: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    vendor: {
                      include: { shopInfo: true },
                    },
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
      path: 'service-booking/vendor',
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

  async getServiceBookingById({
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

  async getServiceBookings({
    userId,
    vendorId,
    res,
    bookingId,
  }: {
    userId?: string;
    vendorId?: string;
    res: Response;
    bookingId: string;
  }) {
    const initialDate = new Date();

    const [booking, serviceBooking] = await Promise.all([
      this.getBookingById(bookingId, userId, vendorId),
      this.getServicBookingByBookingId(bookingId),
    ]);

    if (!booking) {
      throw new BadRequestException(
        'Booking Not found or not associated with the user',
      );
    }

    return await this.response.successResponse({
      initialDate,
      res,
      message: 'Order Items received successfully',
      data: { booking, serviceBooking },
      statusCode: 200,
    });
  }

  async getServiceBookingForAdmin({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetAdminServiceBookingQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where: Prisma.BookingWhereInput = buildAdminServiceBookingWhereFilter(
      {
        query,
      },
    );

    const totalCount = await this.prisma.booking.count({ where });

    const orders = await this.prisma.booking.findMany({
      where,
      skip: Number(offset),
      take: Number(limit),
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        serviceBooking: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            vendorSubService: {
              include: {
                service: {
                  include: {
                    serviceOption: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    vendor: {
                      include: { shopInfo: true, User: true },
                    },
                  },
                },
              },
            },
          },
        },
        bookedUser: true,
      },
    });

    const { vendorName, startDate, endDate, userName, shopName, bookingId } =
      query;

    const queries = buildQueryParams({
      vendorName,
      startDate,
      endDate,
      userName,
      shopName,
      bookingId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'service-booking/admin',
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

  /*----- create -----*/
  async createServiceBooking({
    res,
    userId,
    body,
  }: {
    res: Response;
    userId: string;
    body: CreateServiceBookingDto;
  }) {
    const initialDate = new Date();
    const { serviceBookingsData, vendorSubServices, vendorUserId } =
      await createServiceBookingUtils({
        body,
        vendorServiceService: this.vendorServiceService,
      });

    const bookingId = await createBookingId(this.prisma);

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        bookedId: bookingId,
        serviceBooking: {
          create: serviceBookingsData,
        },
      },
      include: {
        serviceBooking: true,
        bookedUser: {
          select: {
            name: true,
            nameTamil: true,
          },
        },
      },
    });

    // sending realtime data
    await this.serviceBookingGateway.notifyUser(
      vendorSubServices[0].service.vendor.userId,
      'serviceBookingStatus',
      booking,
    );

    //sending notification
    await this.firebaseNotificationService.sendNotificationToAllSession({
      receiverId: vendorUserId,
      isReceiverVendor: true,
      title: '🛒 New Booking Received!',
      content: `You’ve received a new Booking from ${booking.bookedUser.name}. Tap to view booking #${booking.bookedId}.`,
      vendorType: 'SERVICE',
    });

    return this.response.successResponse({
      initialDate,
      res,
      statusCode: 200,
      data: booking,
      message: 'Booking created successfully',
    });
  }

  async changeStatus({
    res,
    body,
    currentUser,
    bookingId,
  }: {
    res: Response;
    body: ChangeBookingStatusDto;
    currentUser: User & { vendor?: Vendor; staff?: Staff };
    bookingId: string;
  }) {
    const { userId, vendorId } = extractUserAndVendorId(currentUser);

    const initialDate = new Date();
    //check booking by Id
    const existingBooking = await this.getBookingById(bookingId);
    if (!existingBooking) {
      throw new BadRequestException('Booking not found');
    }
    await this.checkBookingIsAssociateWithUser(
      existingBooking,
      userId,
      vendorId,
    );
    if (!existingBooking) {
      throw new BadRequestException(
        'Booking not exists or not associated with the user',
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
      updatedBooking = await this.handleServiceCancelBooking({
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
      });
    }

    //sending realtime data
    if (vendorId) {
      await this.serviceBookingGateway.notifyUser(
        updatedBooking.userId,
        'serviceBookingStatus',
        updatedBooking,
      );
    } else {
      await this.serviceBookingGateway.notifyUser(
        userId,
        'serviceBookingStatus',
        updatedBooking,
      );
    }

    //sending notitifcation
    const { title, content, receiverId, isReceiverVendor } =
      getNotificationContentForServiceBookingStatus({
        userId,
        updatedBooking: existingBooking,
        status: updatedBooking.bookingStatus,
      });
    await this.firebaseNotificationService.sendNotificationToAllSession({
      title,
      content,
      receiverId,
      isReceiverVendor,
      vendorType: 'SERVICE',
    });

    return this.response.successResponse({
      initialDate,
      data: updatedBooking,
      message: `Booking of ${existingBooking.bookedId} is changed to ${newStatus} successfully`,
      res,
      statusCode: 200,
    });
  }

  /*----- helper func -----*/
  async getBookingById(bookingId: string, userId?: string, vendorId?: string) {
    const where: Prisma.BookingWhereInput = {
      id: bookingId,
    };

    if (userId) {
      where.userId = userId;
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
    }

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        bookedUser: true,
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
          take: 1,
        },
      },
    });

    return booking;
  }

  async getServicBookingByBookingId(bookingId: string) {
    const serviceBooking = await this.prisma.serviceBooking.findMany({
      where: {
        bookingId,
      },
    });
    return serviceBooking;
  }

  async checkBookingIsAssociateWithUser(
    booking: Booking,
    userId?: string,
    vendorId?: string,
  ) {
    if (vendorId) {
      const bannerItem = await this.prisma.booking.findFirst({
        where: {
          id: booking.id,
        },
        include: {
          serviceBooking: {
            include: {
              vendorSubService: {
                include: {
                  service: {
                    include: {
                      serviceOption: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (
        !bannerItem ||
        bannerItem.serviceBooking.length < 0 ||
        bannerItem.serviceBooking[0].vendorSubService.service.vendorId !==
          vendorId
      ) {
        throw new BadRequestException(
          'You dont have access to change the status of order',
        );
      }
    } else if (userId && booking.userId !== userId) {
      throw new BadRequestException(
        'You dont have access to change the status of order',
      );
    }
  }

  async handleServiceCancelBooking({
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
