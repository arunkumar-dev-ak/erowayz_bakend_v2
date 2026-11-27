import { Test, TestingModule } from '@nestjs/testing';
import { BloodDetailsController } from './blood-details.controller';
import { BloodDetailsService } from './blood-details.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

describe('BloodDetailsController', () => {
  let controller: BloodDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BloodDetailsController],
      providers: [
        {
          provide: BloodDetailsService,
          useValue: {
            getBloodDetail: jest.fn(),
            getBloodDetailRequest: jest.fn(),
            requestBloodDetail: jest.fn(),
            verifyBloodRequest: jest.fn(),
          },
        },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: VendorSubscriptionService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BloodDetailsController>(BloodDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
