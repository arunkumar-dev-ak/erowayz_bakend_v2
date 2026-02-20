import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { EasebuzzService } from './easebuzz.service';
import { Request, Response } from 'express';
import { GetEaseBuzzPaymentDto } from './dto/get-easebuzz.dto';

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

  @Post('easebuzz-webhook')
  async handleWebhook(
    @Req() req: Request,
    @Body() body: any,
    @Res() res: Response,
  ) {
    // const order = body.content.order;
    // const txn_detail = order.txn_detail;
    // const card = order.card;
    // await this.paymentJuspayService.handleJuspayResponse({
    //   order,
    //   txn_detail,
    //   card,
    // });
    console.log(body);
    return res.status(200).json({ success: true, message: 'Webhook received' });
  }
}
