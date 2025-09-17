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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractVendorIdFromRequest } from 'src/common/functions/extractVendorid';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { VendorServiceService } from './vendor-service.service';
import { CreateVendorServiceDto } from './dto/create-vendor-service.dto';
import { UpdateVendorServiceDto } from './dto/update-vendor-service.dto';
import { GetServiceQueryDto } from './dto/get-vendor-service-query.dto';

@Controller('vendor-service')
export class VendorServiceController {
  constructor(private readonly vendorServiceService: VendorServiceService) {}

  @ApiOperation({ summary: 'Get vendor services with filters' })
  @Get()
  async getVendorSubServicesForVendor(
    @Res() res: Response,
    @Query() query: GetServiceQueryDto,
  ) {
    const { offset = 0, limit = 10 } = query;
    return await this.vendorServiceService.getService({
      res,
      query,
      offset: Number(offset),
      limit: Number(limit),
    });
  }

  @ApiOperation({ summary: 'Create a vendor service' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 5))
  async createVendorSubService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateVendorServiceDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required.');
    }
    const vendorId = extractVendorIdFromRequest(req);
    return await this.vendorServiceService.createService({
      body,
      res,
      vendorId,
      images,
    });
  }

  @ApiOperation({ summary: 'Update a vendor service' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Put('update/:serviceId')
  @UseInterceptors(FilesInterceptor('images', 5))
  async updateVendorSubService(
    @Req() req: Request,
    @Res() res: Response,
    @Param('serviceId') serviceId: string,
    @Body() body: UpdateVendorServiceDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.vendorServiceService.updateService({
      res,
      body,
      images,
      vendorId,
      serviceId,
    });
  }

  @ApiOperation({ summary: 'Delete a vendor sub-service' })
  @ApiBearerAuth()
  @Roles(Role.VENDOR, Role.STAFF)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:serviceId')
  async deleteVendorSubService(
    @Req() req: Request,
    @Res() res: Response,
    @Param('serviceId') serviceId: string,
  ) {
    const vendorId = extractVendorIdFromRequest(req);
    return await this.vendorServiceService.deleteVendorService({
      vendorId,
      serviceId,
      res,
    });
  }
}
