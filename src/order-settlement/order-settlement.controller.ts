import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderSettlementService } from './order-settlement.service';
import { GetOrderSettlementQueryDto } from './dto/get-order-settlement';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Response } from 'express';
import { CreateOrderSettlementDto } from './dto/create-order-settlement';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdateOrderSettlementDto } from './dto/update-order-settlement';
import { CurrentUser } from 'src/common/decorator/currentuser.decorator';

@Controller('order-settlement')
export class OrderSettlementController {
  constructor(
    private readonly orderSettlementService: OrderSettlementService,
  ) {}

  @Roles(Role.ADMIN, Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  async getOrderSettlement(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetOrderSettlementQueryDto,
    @CurrentUser() currentUser: User & { vendor?: Vendor; staff?: Staff },
  ) {
    let vendorId: string | undefined;
    if (currentUser.vendor || currentUser.staff) {
      vendorId = currentUser.vendor?.id ?? currentUser.staff?.vendorId;
    }
    await this.orderSettlementService.getOrderSettlement({
      query: {
        ...query,
        vendorId,
      },
      res,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '0'),
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  async createOrderSettlement(
    @Res() res: Response,
    @Body() body: CreateOrderSettlementDto,
  ) {
    await this.orderSettlementService.createOrderSettlement({
      body,
      res,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('proofImage'))
  async uploadOrderSettlementFile(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('ProofImage is required');
    }

    await this.orderSettlementService.uploadFile({
      res,
      file,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:id')
  async updateOrderSettlement(
    @Res() res: Response,
    @Body() body: UpdateOrderSettlementDto,
    @Param('id') id: string,
  ) {
    await this.orderSettlementService.updateOrderSettlement({
      body,
      res,
      orderSettlementId: id,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete(':id')
  async deleteOrderSettlement(@Res() res: Response, @Param('id') id: string) {
    await this.orderSettlementService.deleteOrderSettlement({
      res,
      orderSettlementId: id,
    });
  }
}
