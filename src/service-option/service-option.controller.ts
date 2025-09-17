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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServiceOptionService } from './service-option.service';
import { Response } from 'express';
import { CreateServiceOptionDto } from './dto/createservice-option.dto';
import { UpdateServiceOptionDto } from './dto/updateservice-option.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetServiceOptionQueryDto } from './dto/get-service-option.dto';

@ApiTags('Service Options')
@Controller('service-option')
export class ServiceOptionController {
  constructor(private readonly serviceOptionService: ServiceOptionService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get Service Options by Vendor Type ID',
    description: 'Retrieves the service options for a given vendor type ID.',
  })
  @UsePipes(new ValidationPipe())
  async getServiceOptionById(
    @Res() res: Response,
    @Param('id') vendorTypeId: string,
  ) {
    return await this.serviceOptionService.getServiceOptionByVendorTypeId({
      res,
      vendorTypeId,
    });
  }

  @Get('getAll/admin')
  @ApiOperation({ summary: 'Retrieve all service Option' })
  async getAllServiceOption(
    @Res() res: Response,
    @Query() query: GetServiceOptionQueryDto,
  ) {
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '10');
    return await this.serviceOptionService.getAllServiceOption({
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
  @ApiOperation({
    summary: 'Create a new Service Option',
    description: 'Creates a new service option with the provided details.',
  })
  @UseInterceptors(FileInterceptor('serviceOptImage'))
  @ApiConsumes('multipart/form-data')
  @UsePipes(new ValidationPipe())
  async createServiceOption(
    @Res() res: Response,
    @Body() body: CreateServiceOptionDto,
    @UploadedFile() serviceOptImage: Express.Multer.File,
  ) {
    if (!serviceOptImage) {
      throw new BadRequestException('serviceOptImage is required');
    }
    return await this.serviceOptionService.createServiceOption({
      res,
      body,
      serviceImage: serviceOptImage,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update an existing Service Option',
    description: 'Updates a service option by ID with the new details.',
  })
  @UseInterceptors(FileInterceptor('serviceOptImage'))
  @Put('update/:id')
  @UsePipes(new ValidationPipe())
  async updateServiceOption(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() body: UpdateServiceOptionDto,
    @UploadedFile() serviceOptImage: Express.Multer.File,
  ) {
    return await this.serviceOptionService.updateServiceOption({
      id,
      res,
      body,
      serviceImage: serviceOptImage,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a Service Option',
    description: 'Deletes a service option by its unique ID.',
  })
  @UsePipes(new ValidationPipe())
  async deleteServiceOption(@Res() res: Response, @Param('id') id: string) {
    return await this.serviceOptionService.deleteServiceOption({ res, id });
  }
}
