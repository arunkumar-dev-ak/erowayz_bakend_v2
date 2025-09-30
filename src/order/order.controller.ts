import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { Request, Response } from 'express';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { CustomerGetOrderQueryDto } from './dto/customer-get-order-querydto';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAdminOrderQueryDto } from './dto/get-order-admin-query.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('vendor')
  async getOrderForVendor(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetOrderQueryDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    const vendorId = extractVendorIdFromRequest(req);
    await this.orderService.getOrdersForVendor({
      vendorId,
      res,
      query,
      offset,
      limit,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('customer')
  async getOrderForUser(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: CustomerGetOrderQueryDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    const userId = extractUserIdFromRequest(req);

    await this.orderService.getOrdersForUser({
      userId,
      res,
      query,
      offset,
      limit,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('admin')
  async getOrderForAdmin(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetAdminOrderQueryDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');

    await this.orderService.getOrdersForAdmin({
      res,
      query,
      offset,
      limit,
    });
  }

  @Roles(Role.CUSTOMER, Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('orderItem/:id')
  async getOrderItems(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
    @Param('id') orderId: string,
  ) {
    const userId = extractUserIdFromRequest(req);
    const vendorId = extractVendorIdFromRequest(req, false);

    if (currentUser.role !== 'CUSTOMER' && !vendorId) {
      throw new BadRequestException(
        'You dont have permission to access this resource',
      );
    }

    await this.orderService.getOrderItems({
      res,
      orderId,
      userId,
      vendorId,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('create')
  async createOrder(
    @Res() res: Response,
    @Body() body: CreateOrderDto,
    @CurrentUser() user: User & { vendor?: Vendor; staff?: Staff },
  ) {
    await this.orderService.createOrder({
      userId: user.id,
      res,
      body,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('order-payment')
  async createOrderPayment(
    @Res() res: Response,
    @Body() body: OrderPaymentDto,
    @CurrentUser() user: User,
  ) {
    await this.orderService.paymentForOrder({
      userId: user.id,
      res,
      body,
    });
  }

  @Roles(Role.CUSTOMER, Role.STAFF, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Put('changeStatus/:id')
  async changeOrderStatus(
    @Res() res: Response,
    @Body() body: ChangeOrderStatusDto,
    @CurrentUser() user: User & { vendor?: Vendor; staff?: Staff },
    @Param('id') orderId: string,
  ) {
    await this.orderService.changeStatus({
      orderId,
      res,
      body,
      currentUser: user,
    });
  }
}
