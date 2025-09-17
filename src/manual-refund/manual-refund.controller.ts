import { Controller } from '@nestjs/common';
import { ManualRefundService } from './manual-refund.service';

@Controller('manual-refund')
export class ManualRefundController {
  constructor(private readonly manualRefundService: ManualRefundService) {}
}
