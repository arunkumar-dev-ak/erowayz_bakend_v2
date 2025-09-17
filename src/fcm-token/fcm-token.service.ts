import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async createFcmToken({
    tx,
    userId,
    deviceId,
    token,
  }: {
    tx?: Prisma.TransactionClient;
    userId: string;
    deviceId?: string;
    token: string;
  }) {
    const isTokenPresent = await this.checkFcmTokenByToken({ fcmToken: token });
    if (isTokenPresent && isTokenPresent.userId === userId) {
      return isTokenPresent;
    }
    const queryClient = tx ? tx : this.prisma;
    const newToken = await queryClient.fCMToken.upsert({
      where: { token },
      update: {
        userId,
        deviceId,
      },
      create: {
        userId,
        deviceId,
        token,
      },
    });
    return newToken;
  }

  async checkFcmTokenByToken({ fcmToken }: { fcmToken: string }) {
    const token = await this.prisma.fCMToken.findUnique({
      where: {
        token: fcmToken,
      },
    });
    return token;
  }

  async deleteFcmToken({
    tx,
    token,
  }: {
    tx?: Prisma.TransactionClient;
    token: string;
  }) {
    const queryClient = tx ? tx : this.prisma;

    const existingFcmToken = await this.findFcmTokenByToken({ token });
    if (!existingFcmToken) {
      return false;
    }
    await queryClient.fCMToken.delete({
      where: {
        token,
      },
    });
    return true;
  }

  async deleteFcmTokenByUserId({
    userId,
    tx,
  }: {
    userId: string;
    tx: Prisma.TransactionClient;
  }) {
    const queryClient = tx ? tx : this.prisma;
    await queryClient.fCMToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  async findFcmTokenByToken({ token }: { token: string }) {
    return await this.prisma.fCMToken.findUnique({
      where: {
        token,
      },
    });
  }
}
