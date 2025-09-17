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
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { KeywordService } from './keyword.service';
import { GetKeyWordQueryDto } from './dto/get-keyword-query.dto';
import { createKeyWordDto } from './dto/create-keyword.dto';
import { updateKeyWordDto } from './dto/update-keyword.dto';

@ApiTags('keyword')
@Controller('keyword')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @ApiOperation({
    summary: 'Get All Keyword',
  })
  @Get()
  async getKeyword(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetKeyWordQueryDto,
  ) {
    await this.keywordService.getKeyword({
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
    summary: 'Create keyword',
  })
  @Post('create')
  async createKeyword(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: createKeyWordDto,
  ) {
    await this.keywordService.createKeyWord({
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update keyword',
  })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the keyword' })
  @Put('updateKeyword/:id')
  async updateItemQty(
    @Res() res: Response,
    @Body() body: updateKeyWordDto,
    @Param('id') keyWordId: string,
  ) {
    await this.keywordService.updateKeyWord({
      res,
      body,
      keyWordId,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove keyword',
  })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the keyword' })
  @Delete('remove/:id')
  async removeItemsFromCart(
    @Res() res: Response,
    @Param('id') keyWordId: string,
  ) {
    await this.keywordService.deleteKeyWord({
      res,
      keyWordId,
    });
  }
}
