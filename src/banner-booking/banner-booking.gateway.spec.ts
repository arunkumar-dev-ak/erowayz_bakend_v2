import { Test, TestingModule } from '@nestjs/testing';
import { BannerBookingGateway } from './banner-booking.gateway';

describe('BannerBookingGateway', () => {
  let gateway: BannerBookingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerBookingGateway],
    }).compile();

    gateway = module.get<BannerBookingGateway>(BannerBookingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
