import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ResponseModule } from '../response/response.module';
import { TokenModule } from '../token/token.module';
import { TrustBadgeController } from './trust-badge.controller';
import { TrustBadgeService } from './trust-badge.service';

@Module({
  imports: [PrismaModule, RedisModule, ResponseModule, TokenModule],
  controllers: [TrustBadgeController],
  providers: [TrustBadgeService],
  exports: [TrustBadgeService],
})
export class TrustBadgeModule {}
