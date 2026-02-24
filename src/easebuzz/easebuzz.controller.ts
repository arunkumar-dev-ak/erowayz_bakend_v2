import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { EasebuzzService } from './easebuzz.service';
import { Response } from 'express';
import { GetEaseBuzzPaymentDto } from './dto/get-easebuzz.dto';
import { EasebuzzWebhookDto } from './dto/easebuzz-webhook.dto';
import { GetEaseBuzzSuccessQueryDto } from './dto/get-easebuzz-success-response.dto';

@Controller('easebuzz')
export class EasebuzzController {
  constructor(private readonly easebuzzService: EasebuzzService) {}

  @Get('payment-details')
  async getJuspayOrder(
    @Body() body: GetEaseBuzzPaymentDto,
    @Res() res: Response,
  ) {
    await this.easebuzzService.handleCheckPayment({ body, res });
  }

  @Get('txn-details')
  async getTxnDetails(
    @Body() body: GetEaseBuzzPaymentDto,
    @Res() res: Response,
  ) {
    await this.easebuzzService.getTransactionById({ body, res });
  }

  @Post('success')
  handleSuccessResponse(
    @Query() query: GetEaseBuzzSuccessQueryDto,
    @Res() res: Response,
  ) {
    const { txnId } = query;

    const deepLink = `erowayz://payment/success?txnid=${txnId}`;

    return res.redirect(deepLink);
  }

  @Post('failure')
  handleFailureResponse(
    @Query() query: GetEaseBuzzSuccessQueryDto,
    @Res() res: Response,
  ) {
    return this.easebuzzService.handleFailureResponse({ res, query });
  }

  @Post('easebuzz-webhook')
  async handleWebhook(@Body() body: EasebuzzWebhookDto, @Res() res: Response) {
    await this.easebuzzService.handleWebHook(body);
    return res.status(200).json({ success: true, message: 'Webhook received' });
  }
}
