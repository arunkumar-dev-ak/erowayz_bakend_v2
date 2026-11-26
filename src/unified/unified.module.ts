import { Module } from '@nestjs/common';
import { UnifiedController } from './unified.controller';
import { UnifiedService } from './unified.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseModule } from 'src/response/response.module';
import { MetadataModule } from 'src/metadata/metadata.module';
import { VendorRatingModule } from 'src/vendor-rating/vendor-rating.module';

@Module({
  imports: [PrismaModule, ResponseModule, MetadataModule, VendorRatingModule],
  controllers: [UnifiedController],
  providers: [UnifiedService],
  exports: [UnifiedService],
})
export class UnifiedModule {}
