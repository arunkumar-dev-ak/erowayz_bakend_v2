import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [VendorModule, OrderModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
