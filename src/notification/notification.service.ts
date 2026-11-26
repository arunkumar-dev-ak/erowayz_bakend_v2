import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseService } from '../response/response.service';
import { MetadataService } from '../metadata/metadata.service';
import { buildQueryParams } from '../common/functions/buildQueryParams';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import {
  NotificationIdentifier,
  resolveNotificationSound,
  resolveScreenForIdentifier,
} from './constants/notification.constants';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metadataService: MetadataService,
  ) {}

  // Persists a notification event with its timestamp, payload, and navigation identifier.
  async createNotificationLog({
    userId,
    title,
    content,
    identifier = NotificationIdentifier.GENERAL,
    payload = {},
  }: {
    userId: string;
    title: string;
    content: string;
    identifier?: string;
    payload?: Record<string, unknown>;
  }) {
    try {
      // Inject standard screen navigation target and audio configuration
      const screenTarget =
        (payload?.screen as string) ?? resolveScreenForIdentifier(identifier);
      const soundConfig = resolveNotificationSound(identifier, payload);

      const enrichedPayload = {
        title,
        body: content,
        receiverId: userId,
        identifier,
        screen: screenTarget,
        soundType: soundConfig.soundType,
        channelId: soundConfig.channelId,
        sound: soundConfig.androidSound,
        ...payload,
      };

      return await this.prisma.notification.create({
        data: {
          userId,
          title,
          content,
          identifier,
          payload: enrichedPayload as Prisma.InputJsonValue,
          isRead: false,
          sentAt: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to persist notification log for user ${userId}: ${error?.message ?? error}`,
        error?.stack,
      );
      return null;
    }
  }

  // Retrieves paginated notifications for the authenticated user with unread count summary.
  async getUserNotifications({
    userId,
    query,
    res,
  }: {
    userId: string;
    query: GetNotificationsQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset ?? 0);
    const limit = Number(query.limit ?? 10);
    const { isRead, identifier } = query;

    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (identifier) {
      where.identifier = identifier;
    }

    const [totalCount, unreadCount, notifications] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.notification.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const queries = buildQueryParams({
      offset: String(offset),
      limit: String(limit),
      isRead: isRead !== undefined ? String(isRead) : undefined,
      identifier: identifier ? String(identifier) : undefined,
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'notification',
      queries,
    });

    return this.responseService.successResponse({
      res,
      data: {
        notifications,
        unreadCount,
      },
      meta,
      message: 'Notifications retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  // Fast badge query returning unread notifications count for the user.
  async getUnreadCount({ userId, res }: { userId: string; res: Response }) {
    const initialDate = new Date();
    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return this.responseService.successResponse({
      res,
      data: { unreadCount },
      message: 'Unread notifications count retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  // Marks a single notification as read after validating user ownership.
  async markAsRead({
    userId,
    notificationId,
    res,
  }: {
    userId: string;
    notificationId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const existing = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Notification not found or access denied');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return this.responseService.successResponse({
      res,
      data: updated,
      message: 'Notification marked as read successfully',
      statusCode: 200,
      initialDate,
    });
  }

  // Marks all unread notifications for the user as read.
  async markAllAsRead({ userId, res }: { userId: string; res: Response }) {
    const initialDate = new Date();

    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return this.responseService.successResponse({
      res,
      data: {
        updatedCount: result.count,
      },
      message: `${result.count} notification(s) marked as read`,
      statusCode: 200,
      initialDate,
    });
  }

  // Deletes a single notification owned by the user.
  async deleteNotification({
    userId,
    notificationId,
    res,
  }: {
    userId: string;
    notificationId: string;
    res: Response;
  }) {
    const initialDate = new Date();

    const existing = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Notification not found or access denied');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return this.responseService.successResponse({
      res,
      data: {},
      message: 'Notification deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
