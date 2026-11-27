import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseModule } from 'src/response/response.module';
import { TokenModule } from 'src/token/token.module';
import { VendorReportController } from './vendor-report.controller';
import { VendorReportService } from './vendor-report.service';

@Module({
  imports: [PrismaModule, ResponseModule, TokenModule],
  controllers: [VendorReportController],
  providers: [VendorReportService],
  exports: [VendorReportService],
})
export class VendorReportModule {}
