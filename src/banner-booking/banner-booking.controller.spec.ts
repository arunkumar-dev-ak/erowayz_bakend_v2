import { Test, TestingModule } from '@nestjs/testing';
import { BannerBookingController } from './banner-booking.controller';
import { BannerBookingService } from './banner-booking.service';

describe('BannerBookingController', () => {
  let controller: BannerBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerBookingController],
      providers: [BannerBookingService],
    }).compile();

    controller = module.get<BannerBookingController>(BannerBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
