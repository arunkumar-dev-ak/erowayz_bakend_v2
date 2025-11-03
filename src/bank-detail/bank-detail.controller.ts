import {
  Controller,
  Get,
  Post,
  Put,
  Query,
  Body,
  Param,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BankDetailService } from './bank-detail.service';
import { GetBankQueryDto } from './dto/get-bank-query.dto';
import { CreateBankDetailDto } from './dto/create-bank-detail.dto';
import { UpdatedBankDetailDto } from './dto/update-bank-detail.dto';
import { UpdateBankDetailVerifyDto } from './dto/update-bank-detail-verify.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';

@ApiTags('Bank Detail')
@ApiBearerAuth()
@Controller('bank-detail')
@UseGuards(AuthGuard)
export class BankDetailController {
  constructor(private readonly bankDetailService: BankDetailService) {}

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Get all bank details for admin' })
  @ApiResponse({
    status: 200,
    description: 'Bank details fetched successfully',
  })
  async getAllBankDetailForAdmin(
    @Res() res: Response,
    @Query() query: GetBankQueryDto,
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ) {
    return this.bankDetailService.getAllBankDetailForAdmin({
      res,
      query,
      offset,
      limit,
    });
  }

  @Roles(Role.VENDOR, Role.STAFF)
  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Get('vendor')
  @ApiOperation({ summary: 'Get bank details for a vendor' })
  @ApiResponse({ status: 200, description: 'Bank detail for vendor retrieved' })
  async getBankDetailForVendor(@Req() req: Request, @Res() res: Response) {
    const vendorId = extractVendorIdFromRequest(req);
    return this.bankDetailService.getBankDetailForVendor({ res, vendorId });
  }

  @Roles(Role.VENDOR)
  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create bank detail for a vendor' })
  @ApiResponse({ status: 201, description: 'Bank detail created successfully' })
  async createBankDetai(
    @Req() req: Request,
    @Body() body: CreateBankDetailDto,
    @Res() res: Response,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return this.bankDetailService.createBankDetai({ body, res, vendorId });
  }

  @Roles(Role.VENDOR)
  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Put('update/:bankDetailId')
  @Roles('vendor')
  @ApiOperation({ summary: 'Update a vendor’s bank detail' })
  @ApiResponse({ status: 200, description: 'Bank detail updated successfully' })
  async updateBankDetail(
    @Req() req: Request,
    @Body() body: UpdatedBankDetailDto,
    @Res() res: Response,
    @Param('bankDetailId') bankDetailId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return this.bankDetailService.updateBankDetail({
      body,
      res,
      vendorId,
      bankDetailId,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Put('status/:bankDetailId')
  @ApiOperation({ summary: 'Change status of a bank detail' })
  async changeBankDetailStatus(
    @Body() body: UpdateBankDetailVerifyDto,
    @Res() res: Response,
    @Param('bankDetailId') bankDetailId: string,
  ) {
    return this.bankDetailService.changeBankDetailStatus({
      res,
      body,
      bankDetailId,
    });
  }
}
