import { Module } from '@nestjs/common';
import { VendorRatingController } from './vendor-rating.controller';
import { VendorRatingService } from './vendor-rating.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseModule } from 'src/response/response.module';
import { RedisModule } from 'src/redis/redis.module';
import { MetadataModule } from 'src/metadata/metadata.module';

@Module({
  imports: [PrismaModule, ResponseModule, RedisModule, MetadataModule],
  controllers: [VendorRatingController],
  providers: [VendorRatingService],
  exports: [VendorRatingService],
})
export class VendorRatingModule {}
