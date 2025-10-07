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
import { CoinsSettlementService } from './coins-settlement.service';
import { GetCoinSettlementQueryDto } from './dto/get-coins-settlement';
import { CreateCoinSettlementDto } from './dto/create-coins-settlement';
import { UpdateCoinSettlementDto } from './dto/update-coins-settlement';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';

@Controller('coins-settlement')
export class CoinsSettlementController {
  constructor(
    private readonly coinsSettlementService: CoinsSettlementService,
  ) {}

  // Admin: Get all coin settlements
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin')
  async getCoinSettlement(
    @Res() res: Response,
    @Query() query: GetCoinSettlementQueryDto,
  ) {
    await this.coinsSettlementService.getCoinSettlement({
      query,
      res,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  // Vendor: Get coin settlements for specific vendor
  @Roles(Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('vendor')
  async getCoinSettlementForVendor(
    @Res() res: Response,
    @Req() req: Request,
    @Query() query: GetCoinSettlementQueryDto,
  ) {
    const vendorId = extractVendorIdFromRequest(req);

    if (!vendorId) {
      throw new BadRequestException('Vendor ID not found');
    }

    await this.coinsSettlementService.getCoinSettlementForVendoe({
      query,
      res,
      vendorId,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  // Admin: Create coin settlement
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  async createCoinSettlement(
    @Res() res: Response,
    @Body() body: CreateCoinSettlementDto,
  ) {
    await this.coinsSettlementService.createCoinSettlement({
      body,
      res,
    });
  }

  // Admin: Update coin settlement
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:id')
  async updateCoinSettlement(
    @Res() res: Response,
    @Body() body: UpdateCoinSettlementDto,
    @Param('id') id: string,
  ) {
    await this.coinsSettlementService.updateCoinSettlement({
      body,
      res,
      coinSettlementId: id,
    });
  }

  // Admin: Delete coin settlement
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete(':id')
  async deleteCoinSettlement(@Res() res: Response, @Param('id') id: string) {
    await this.coinsSettlementService.deleteCoinSettlement({
      res,
      coinSettlementId: id,
    });
  }

  // Admin: Upload settlement proof file
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('proofImage'))
  async uploadCoinSettlementFile(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('ProofImage is required');
    }

    await this.coinsSettlementService.uploadFile({
      res,
      file,
    });
  }
}
