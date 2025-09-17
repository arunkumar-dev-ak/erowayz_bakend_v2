import { Test, TestingModule } from '@nestjs/testing';
import { ServiceBookingGateway } from './service-booking.gateway';

describe('ServiceBookingGateway', () => {
  let gateway: ServiceBookingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceBookingGateway],
    }).compile();

    gateway = module.get<ServiceBookingGateway>(ServiceBookingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
