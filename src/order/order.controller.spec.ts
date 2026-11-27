import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: { createOrder: jest.fn() } },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: VendorSubscriptionService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
