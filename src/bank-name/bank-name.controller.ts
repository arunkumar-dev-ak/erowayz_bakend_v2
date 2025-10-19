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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { BankNameNameService } from './bank-name.service';
import { GetBankNameQueryDto } from './dto/get-bank.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { CreateBankNameDto } from './dto/create-bank.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UpdateBankNameDto } from './dto/update-bank.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('bank-name')
export class BankNameController {
  constructor(private readonly bankNameService: BankNameNameService) {}

  @ApiOperation({ summary: 'Get Bank Names with filtering & pagination' })
  @Get()
  async getBankNames(
    @Res() res: Response,
    @Query() query: GetBankNameQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.bankNameService.getBankName({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Bank Name' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Bank Name creation payload',
    type: CreateBankNameDto,
  })
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createBankName(
    @Res() res: Response,
    @Body() body: CreateBankNameDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }
    return await this.bankNameService.createBankName({
      res,
      body,
      file,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing Bank Name' })
  @ApiParam({ name: 'bankNameId', type: String, description: 'Bank Name ID' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    description: 'Bank Name update payload',
    type: UpdateBankNameDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:bankNameId')
  async updateBankName(
    @Res() res: Response,
    @Body() body: UpdateBankNameDto,
    @Param('bankNameId') bankNameId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.bankNameService.updateBankName({
      file,
      res,
      body,
      bankNameId,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Bank Name' })
  @ApiParam({ name: 'bankNameId', type: String, description: 'Bank Name ID' })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:bankNameId')
  async deleteBankName(
    @Res() res: Response,
    @Param('bankNameId') bankNameId: string,
  ) {
    return await this.bankNameService.deleteBankName({ res, bankNameId });
  }
}
