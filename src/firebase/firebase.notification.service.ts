import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { app } from 'firebase-admin';
import { FCMToken, Staff, User, Vendor } from '@prisma/client';

export type ReceiverWithVendorAndStaff = User & {
  fcmToken: FCMToken[];
  vendor?:
    | (Vendor & {
        staff: (Staff & {
          user: User & {
            fcmToken: FCMToken[];
          };
        })[];
      })
    | null;
};

@Injectable()
export class FirebaseNotificationService {
  private readonly logger = new Logger(FirebaseNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: app.App,
  ) {}

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    const message = {
      data: {
        title,
        body,
        ...data,
      },
      token,
    };

    try {
      await this.firebaseApp.messaging().send(message);
      return true;
    } catch (error) {
      this.logger.warn(`Failed to send notification to token: ${token}`, error);
      return false;
    }
  }

  async sendNotificationToAllSession({
    receiverId,
    content,
    isReceiverVendor,
    title,
    ...meta
  }: {
    receiverId: string;
    content: string;
    isReceiverVendor: boolean;
    title: string;
    [key: string]: unknown;
  }) {
    try {
      const receiver: ReceiverWithVendorAndStaff | null =
        await this.fetchReceiverWithTokens(receiverId);

      if (!receiver) {
        this.logger.warn(`Receiver with ID ${receiverId} not found.`);
        return;
      }

      const allTokens = this.collectAllTokens(receiver);

      if (!allTokens.length) {
        this.logger.warn(
          `No tokens found for receiver ${receiverId} or related staff.`,
        );
        return;
      }

      const data = {
        receiverId,
        isReceiverVendor: String(isReceiverVendor),
        ...meta,
      };

      const invalidTokens: string[] = [];

      await Promise.all(
        allTokens.map(async (token) => {
          const success = await this.sendNotification(
            token,
            title,
            content,
            data,
          );
          if (!success) invalidTokens.push(token);
        }),
      );

      if (invalidTokens.length) {
        await this.cleanupInvalidTokens(invalidTokens);
        this.logger.warn(`Cleaned up ${invalidTokens.length} invalid tokens.`);
      }
    } catch (error) {
      this.logger.error('Error sending notification to all sessions:', error);
    }
  }

  private async fetchReceiverWithTokens(
    receiverId: string,
  ): Promise<ReceiverWithVendorAndStaff | null> {
    return this.prisma.user.findUnique({
      where: { id: receiverId },
      include: {
        fcmToken: true,
        vendor: {
          include: {
            staff: {
              include: {
                user: {
                  include: { fcmToken: true },
                },
              },
            },
          },
        },
      },
    });
  }

  private collectAllTokens(receiver: ReceiverWithVendorAndStaff): string[] {
    const receiverTokens =
      receiver.fcmToken.map((token: FCMToken) => token.token) || [];

    const staffTokens =
      receiver.vendor?.staff?.flatMap((staff) =>
        staff.user.fcmToken.map((token: FCMToken) => token.token),
      ) || [];

    return [...receiverTokens, ...staffTokens];
  }

  private async cleanupInvalidTokens(tokens: string[]) {
    await this.prisma.fCMToken.deleteMany({
      where: { token: { in: tokens } },
    });
  }
}
