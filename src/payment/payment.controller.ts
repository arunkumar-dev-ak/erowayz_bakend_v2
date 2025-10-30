import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { JuspayWebHookType } from './dto/juspay-webhook.dto';
import { GetPaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
import { PaymentJuspayService } from './payment.juspay.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentJuspayService: PaymentJuspayService) {}

  @Get()
  async getJuspayOrder(@Body() body: GetPaymentDto, @Res() res: Response) {
    await this.paymentJuspayService.fetchOrder({ body, res });
  }

  @Post('juspay-webhook')
  async handleWebhook(
    @Req() req: Request,
    @Body() body: JuspayWebHookType,
    @Res() res: Response,
  ) {
    const order = body.content.order;
    const txn_detail = order.txn_detail;
    const card = order.card;
    await this.paymentJuspayService.handleJuspayResponse({
      order,
      txn_detail,
      card,
    });
    return res.status(200).json({ success: true, message: 'Webhook received' });
  }
}
