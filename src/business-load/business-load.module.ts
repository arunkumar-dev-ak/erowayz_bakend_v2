import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ResponseModule } from '../response/response.module';
import { TokenModule } from '../token/token.module';
import { BusinessLoadController } from './business-load.controller';
import { BusinessLoadService } from './business-load.service';

@Module({
  imports: [PrismaModule, RedisModule, ResponseModule, TokenModule],
  controllers: [BusinessLoadController],
  providers: [BusinessLoadService],
  exports: [BusinessLoadService],
})
export class BusinessLoadModule {}
