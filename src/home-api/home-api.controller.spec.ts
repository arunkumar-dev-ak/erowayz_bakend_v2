import { Test, TestingModule } from '@nestjs/testing';
import { HomeApiController } from './home-api.controller';
import { HomeApiService } from './home-api.service';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { VendorSubscriptionService } from '../vendor-subscription/vendor-subscription.service';

describe('HomeApiController', () => {
  let controller: HomeApiController;
  let homeApiServiceMock: any;

  beforeEach(async () => {
    homeApiServiceMock = {
      getBarChartData: jest.fn(),
      getVendorDashboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeApiController],
      providers: [
        { provide: HomeApiService, useValue: homeApiServiceMock },
        { provide: TokenService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: VendorSubscriptionService, useValue: {} },
      ],
    }).compile();

    controller = module.get<HomeApiController>(HomeApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
