import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { VendorTopUpDto } from './dto/vendor-topup.dto';
import { Request, Response } from 'express';
import { VendorTransferToCustomerDto } from './dto/vendor-to-customer.dto';
import { GetWalletTransactionQueryForAdminDto } from './dto/get-wallet-transaction-query.dto';
import { extractVendorSubFromRequest } from 'src/common/functions/extact-sub';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get()
  async getWallet(
    @Res() res: Response,
    @CurrentUser()
    currentUser: User & { vendor?: Vendor; staff?: Staff & { vendor: Vendor } },
  ) {
    const userId = currentUser.staff?.vendor.userId ?? currentUser.id;

    await this.walletService.getWalletForUser({
      res,
      userId,
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('topUp')
  async vendorWalletTopUp(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: VendorTopUpDto,
    @CurrentUser() user: User & { vendor?: Vendor; staff?: Staff },
  ) {
    const currentSub = extractVendorSubFromRequest(req);
    await this.walletService.walletTopUpReq({
      userId: user.id,
      res,
      body,
      vendorId: user.vendor!.id,
      currentSubscription: currentSub,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('walletTransaction/admin')
  async getWalletTransaction(
    @Res() res: Response,
    @Query() query: GetWalletTransactionQueryForAdminDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    await this.walletService.getWalletTransaction({
      query,
      res,
      offset,
      limit,
      origin: 'ADMIN',
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN, Role.CUSTOMER, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Get('walletTransaction/user')
  async getWalletTransactionForUser(
    @Res() res: Response,
    @Query() query: GetWalletTransactionQueryForAdminDto,
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
  ) {
    const userId = currentUser.id;
    const vendorId =
      currentUser.vendor?.id ?? currentUser.staff?.id ?? undefined;
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    await this.walletService.getWalletTransaction({
      query: {
        ...query,
        userId,
        vendorId,
      },
      res,
      offset,
      limit,
      origin: 'USER',
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('vendorToCustomer')
  async vendorToCustomerWallet(
    @Res() res: Response,
    @Body() body: VendorTransferToCustomerDto,
    @CurrentUser() user: User & { vendor?: Vendor; staff?: Staff },
  ) {
    await this.walletService.safeVendorToCustomerTransfer({
      vendorUserId: user.id,
      res,
      body,
    });
  }

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('vendorToAdmin')
  async vendorToAdmin(
    @Res() res: Response,
    @Body() body: VendorTopUpDto,
    @CurrentUser() user: User & { vendor?: Vendor; staff?: Staff },
  ) {
    await this.walletService.safeReturnCoinsOfVendor({
      userId: user.id,
      vendorId: user.vendor!.id,
      res,
      body,
    });
  }
}
