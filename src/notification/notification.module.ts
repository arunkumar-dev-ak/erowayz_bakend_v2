import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResponseModule } from '../response/response.module';
import { MetadataModule } from '../metadata/metadata.module';
import { TokenModule } from '../token/token.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [PrismaModule, ResponseModule, MetadataModule, TokenModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
