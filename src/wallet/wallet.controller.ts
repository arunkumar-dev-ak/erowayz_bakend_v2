import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';
import { VendorTopUpDto } from './dto/vendor-topup.dto';
import { Response } from 'express';
import { VendorTransferToCustomerDto } from './dto/vendor-to-customer.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('topUp')
  async vendorWalletTopUp(
    @Res() res: Response,
    @Body() body: VendorTopUpDto,
    @CurrentUser() user: User & { vendor?: Vendor; staff?: Staff },
  ) {
    await this.walletService.walletTopUpReq({
      userId: user.id,
      res,
      body,
      vendorId: user.vendor!.id,
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
