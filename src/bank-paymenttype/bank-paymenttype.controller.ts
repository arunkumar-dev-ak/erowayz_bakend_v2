import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BankPaymenttypeService } from './bank-paymenttype.service';
import { CreateBankPaymentTypeDto } from './dto/create-bank-paymenttype.dto';
import { UpdateBankPaymentTypeDto } from './dto/update-bank-paymenttype.dto';
import { GetBankPaymentTypeQueryDto } from './dto/get-bank-paymenttype.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('bank-paymenttype')
export class BankPaymenttypeController {
  constructor(
    private readonly bankPaymenttypeService: BankPaymenttypeService,
  ) {}

  @ApiOperation({
    summary: 'Get Bank Payment Types with filtering & pagination',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Pagination limit',
  })
  @Get()
  async getBankPaymentTypes(
    @Res() res: Response,
    @Query() query: GetBankPaymentTypeQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.bankPaymenttypeService.getBankPaymentType({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new Bank Payment Type' })
  @ApiBody({
    description: 'Bank Payment Type creation payload',
    type: CreateBankPaymentTypeDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('image'))
  @Post('/create')
  async createBankPaymentType(
    @Res() res: Response,
    @Body() body: CreateBankPaymentTypeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    return await this.bankPaymenttypeService.createBankPaymentType({
      res,
      body,
      file,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing Bank Payment Type' })
  @ApiParam({
    name: 'bankPaymentTypeId',
    type: String,
    description: 'Bank Payment Type ID',
  })
  @ApiBody({
    description: 'Bank Payment Type update payload',
    type: UpdateBankPaymentTypeDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Put('/update/:bankPaymentTypeId')
  async updateBankPaymentType(
    @Res() res: Response,
    @Body() body: UpdateBankPaymentTypeDto,
    @Param('bankPaymentTypeId') bankPaymentTypeId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.bankPaymenttypeService.updateBankPaymentType({
      res,
      body,
      bankPaymentTypeId,
      file,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Bank Payment Type' })
  @ApiParam({
    name: 'bankPaymentTypeId',
    type: String,
    description: 'Bank Payment Type ID',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:bankPaymentTypeId')
  async deleteBankPaymentType(
    @Res() res: Response,
    @Param('bankPaymentTypeId') bankPaymentTypeId: string,
  ) {
    return await this.bankPaymenttypeService.deleteBankPaymentType({
      res,
      bankPaymentTypeId,
    });
  }
}
