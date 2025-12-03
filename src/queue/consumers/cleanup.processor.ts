// consumers/cleanup.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type OtpRecord = { id: string };
type TempRegisterRecord = { id: string; cacheKey: string };

@Processor('cleanup')
@Injectable()
export class CleanupProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('cleanup-expired-otp-temp-register-job')
  async cleanupExpiredRecords(): Promise<void> {
    const batchSize = 500;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1); // 1 day old

    // 1. CLEANUP OTP RECORDS (1 day old)
    let otpLastId: string | null = null;
    let otpHasMore = true;

    while (otpHasMore) {
      const otps: OtpRecord[] = await this.prisma.oTP.findMany({
        where: {
          createdAt: { lt: cutoffDate },
          ...(otpLastId ? { cursor: { id: otpLastId }, skip: 1 } : {}),
        },
        select: { id: true },
        take: batchSize,
        orderBy: { id: 'asc' },
      });

      if (otps.length === 0) {
        otpHasMore = false;
        break;
      }

      const otpIds: string[] = otps.map((otp: OtpRecord) => otp.id);

      await this.prisma.oTP.deleteMany({
        where: { id: { in: otpIds } },
      });

      otpLastId = otps[otps.length - 1]?.id ?? null;
    }

    // 2. CLEANUP TEMPREGISTER RECORDS (1 day old)
    let tempLastId: string | null = null;
    let tempHasMore = true;

    while (tempHasMore) {
      const tempRegisters: TempRegisterRecord[] =
        await this.prisma.tempRegister.findMany({
          where: {
            createdAt: { lt: cutoffDate },
            ...(tempLastId ? { cursor: { id: tempLastId }, skip: 1 } : {}),
          },
          select: { id: true, cacheKey: true },
          take: batchSize,
          orderBy: { id: 'asc' },
        });

      if (tempRegisters.length === 0) {
        tempHasMore = false;
        break;
      }

      const tempIds: string[] = tempRegisters.map(
        (tr: TempRegisterRecord) => tr.id,
      );

      // Delete from database
      await this.prisma.$transaction(async (tx) => {
        const result = await tx.tempRegister.deleteMany({
          where: { id: { in: tempIds } },
        });
        return result;
      });

      tempLastId = tempRegisters[tempRegisters.length - 1]?.id ?? null;
    }
  }
}
