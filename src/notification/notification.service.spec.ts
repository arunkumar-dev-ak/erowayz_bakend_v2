import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseService } from '../response/response.service';
import { MetadataService } from '../metadata/metadata.service';
import { NotFoundException } from '@nestjs/common';
import {
  NotificationIdentifier,
  NotificationNavigationScreen,
} from './constants/notification.constants';

describe('NotificationService', () => {
  let service: NotificationService;
  let prismaMock: any;
  let responseMock: any;
  let metadataMock: any;

  beforeEach(async () => {
    prismaMock = {
      notification: {
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    responseMock = {
      successResponse: jest.fn().mockImplementation((args) => args),
      errorResponse: jest.fn(),
    };

    metadataMock = {
      createMetaData: jest.fn().mockReturnValue({ totalCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ResponseService, useValue: responseMock },
        { provide: MetadataService, useValue: metadataMock },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotificationLog', () => {
    it('should create a notification log with auto screen navigation resolution', async () => {
      const mockCreated = {
        id: 'notif-1',
        userId: 'user-1',
        title: 'New Order',
        content: 'Order received',
        identifier: NotificationIdentifier.NEW_ORDER,
        payload: {
          orderId: 'ORD-1',
          screen: NotificationNavigationScreen.ORDER_DETAILS,
          identifier: 'NEW_ORDER',
        },
        isRead: false,
      };

      prismaMock.notification.create.mockResolvedValue(mockCreated);

      const result = await service.createNotificationLog({
        userId: 'user-1',
        title: 'New Order',
        content: 'Order received',
        identifier: NotificationIdentifier.NEW_ORDER,
        payload: { orderId: 'ORD-1' },
      });

      expect(prismaMock.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            title: 'New Order',
            identifier: NotificationIdentifier.NEW_ORDER,
            isRead: false,
            payload: expect.objectContaining({
              title: 'New Order',
              body: 'Order received',
              receiverId: 'user-1',
              orderId: 'ORD-1',
              screen: NotificationNavigationScreen.ORDER_DETAILS,
              soundType: 'NEW_ORDER',
              channelId: 'new_order_channel',
              sound: 'order_ring',
            }),
          }),
        }),
      );
      expect(result).toEqual(mockCreated);
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications with unread count', async () => {
      const mockNotifications = [{ id: 'notif-1', isRead: false }];
      prismaMock.notification.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(2); // unread
      prismaMock.notification.findMany.mockResolvedValue(mockNotifications);

      const res: any = {};
      await service.getUserNotifications({
        userId: 'user-1',
        query: { offset: 0, limit: 10 },
        res,
      });

      expect(responseMock.successResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            notifications: mockNotifications,
            unreadCount: 2,
          },
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notifications count', async () => {
      prismaMock.notification.count.mockResolvedValue(4);
      const res: any = {};

      await service.getUnreadCount({ userId: 'user-1', res });

      expect(responseMock.successResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { unreadCount: 4 },
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read if owned by user', async () => {
      prismaMock.notification.findFirst.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
      });
      prismaMock.notification.update.mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      });
      const res: any = {};

      await service.markAsRead({
        userId: 'user-1',
        notificationId: 'notif-1',
        res,
      });

      expect(prismaMock.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif-1' },
          data: expect.objectContaining({ isRead: true }),
        }),
      );
    });

    it('should throw NotFoundException if notification does not exist or not owned', async () => {
      prismaMock.notification.findFirst.mockResolvedValue(null);
      const res: any = {};

      await expect(
        service.markAsRead({
          userId: 'user-1',
          notificationId: 'notif-999',
          res,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for user', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 7 });
      const res: any = {};

      await service.markAllAsRead({ userId: 'user-1', res });

      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isRead: false,
        },
        data: expect.objectContaining({ isRead: true }),
      });
      expect(responseMock.successResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { updatedCount: 7 },
        }),
      );
    });
  });
});
