import { Test, TestingModule } from '@nestjs/testing';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

describe('BannerController', () => {
  let controller: BannerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerController],
      providers: [
        { provide: BannerService, useValue: { setBannerItems: jest.fn() } },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: VendorSubscriptionService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BannerController>(BannerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
