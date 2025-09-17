import { Test, TestingModule } from '@nestjs/testing';
import { ManualRefundController } from './manual-refund.controller';
import { ManualRefundService } from './manual-refund.service';

describe('ManualRefundController', () => {
  let controller: ManualRefundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManualRefundController],
      providers: [ManualRefundService],
    }).compile();

    controller = module.get<ManualRefundController>(ManualRefundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
