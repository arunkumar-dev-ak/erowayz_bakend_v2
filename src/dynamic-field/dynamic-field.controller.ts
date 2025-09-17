import {
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
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { DynamicFieldService } from './dynamic-field.service';
import { GetDynamicFieldQueryDto } from './dto/get-dynamic-field-query.dto';
import { CreateDynamicFieldDto } from './dto/create-dynamic-field.dto';
import { UpdateDynamicFieldDto } from './dto/update-dynamic-field.dto copy';
import { ChangeDynamicFieldStatusDto } from './dto/change-dynamic-field-status.dto copy 2';

@ApiTags('dynamic-field')
@Controller('dynamic-field')
export class DynamicFieldController {
  constructor(private readonly dynamicFieldService: DynamicFieldService) {}

  @ApiOperation({
    summary: 'Get all dynamic fields',
  })
  @Get()
  async getDynamicField(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetDynamicFieldQueryDto,
  ) {
    await this.dynamicFieldService.getDynamicField({
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new dynamic field',
  })
  @Post('create')
  async createDynamicField(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateDynamicFieldDto,
  ) {
    await this.dynamicFieldService.createDynamicField({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a dynamic field',
  })
  @ApiParam({ name: 'id', type: String, description: 'Dynamic field ID' })
  @Put('update/:id')
  async updateDynamicField(
    @Res() res: Response,
    @Body() body: UpdateDynamicFieldDto,
    @Param('id') dynFieldId: string,
  ) {
    await this.dynamicFieldService.updateDynamicField({
      res,
      body,
      dynFieldId,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change status of a dynamic field',
  })
  @ApiParam({ name: 'id', type: String, description: 'Dynamic field ID' })
  @Put('change-status/:id')
  async changeDynamicFieldStatus(
    @Res() res: Response,
    @Body() body: ChangeDynamicFieldStatusDto,
    @Param('id') dynFieldId: string,
  ) {
    await this.dynamicFieldService.changeDynamicFieldStatus({
      res,
      body,
      dynFieldId,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a dynamic field',
  })
  @ApiParam({ name: 'id', type: String, description: 'Dynamic field ID' })
  @Delete('delete/:id')
  async deleteDynamicField(
    @Res() res: Response,
    @Param('id') dynFieldId: string,
  ) {
    await this.dynamicFieldService.deleteDynamicField({
      res,
      dynFieldId,
    });
  }
}
