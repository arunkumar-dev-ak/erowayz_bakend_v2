import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseModule } from 'src/response/response.module';
import { TokenModule } from 'src/token/token.module';
import { CustomerReportController } from './customer-report.controller';
import { CustomerReportService } from './customer-report.service';

@Module({
  imports: [PrismaModule, ResponseModule, TokenModule],
  controllers: [CustomerReportController],
  providers: [CustomerReportService],
  exports: [CustomerReportService],
})
export class CustomerReportModule {}
