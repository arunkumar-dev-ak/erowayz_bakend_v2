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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateVendorTypeDto } from './dto/createvendortype.dto';
import { VendorTypeService } from './vendor-type.service';
import { UpdateVendorTypeDto } from './dto/updatevendortype.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { extractAdminIdFromRequest } from 'src/common/functions/extractAdminId';
import { GetVendorTypeQueryDto } from './dto/get-vendor-type.dto';

@ApiTags('Vendor Type')
@Controller('vendor-type')
export class VendorTypeController {
  constructor(private readonly vendorTypeService: VendorTypeService) {}

  @Get('getAll')
  @ApiOperation({ summary: 'Retrieve all vendor types' })
  async getAllVendorTypes(
    @Res() res: Response,
    @Query() query: GetVendorTypeQueryDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    return await this.vendorTypeService.getAllVendorType({
      res,
      query,
      offset,
      limit,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new vendor type' })
  @UseInterceptors(FileInterceptor('imageRef'))
  @UsePipes(new ValidationPipe())
  async createVendorType(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateVendorTypeDto,
    @UploadedFile() imageRef: Express.Multer.File,
  ) {
    const adminId = extractAdminIdFromRequest(req);
    if (!imageRef) {
      throw new BadRequestException('Image Ref is required');
    }
    return await this.vendorTypeService.createVendorType({
      userId: adminId,
      res,
      body,
      imageRef,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Update a vendor type by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Vendor Type ID' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imageRef'))
  @Put('update/:id')
  @UsePipes(new ValidationPipe())
  async updateVendorType(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() body: UpdateVendorTypeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.vendorTypeService.updateVendorType({
      image,
      id,
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a vendor type by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Vendor Type ID' })
  async deleteVendorType(@Res() res: Response, @Param('id') id: string) {
    return await this.vendorTypeService.deleteVendorType({ res, id });
  }
}
