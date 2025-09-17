import { Test, TestingModule } from '@nestjs/testing';
import { OrderGatewayGateway } from './order-gateway.gateway';

describe('OrderGatewayGateway', () => {
  let gateway: OrderGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderGatewayGateway],
    }).compile();

    gateway = module.get<OrderGatewayGateway>(OrderGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
