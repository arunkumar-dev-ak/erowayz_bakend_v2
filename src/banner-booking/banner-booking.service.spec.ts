import { Test, TestingModule } from '@nestjs/testing';
import { BannerBookingService } from './banner-booking.service';

describe('BannerBookingService', () => {
  let service: BannerBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerBookingService],
    }).compile();

    service = module.get<BannerBookingService>(BannerBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
