import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Res,
  Param,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { DisclaimerService } from './disclaimer.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateDisclaimerDto } from './dto/create-disclaimer.dto';
import { UpdateDisclaimerDto } from './dto/update-disclaimer.dto';
import { GetDisclaimerQueryDto } from './dto/get-discalimer.dto';

@Controller('disclaimer')
export class DisclaimerController {
  constructor(private readonly disclaimerService: DisclaimerService) {}

  @ApiOperation({ summary: 'Get all Disclaimers' })
  @Get()
  async getDisclaimer(
    @Res() res: Response,
    @Query() query: GetDisclaimerQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.disclaimerService.getDisclaimer({
      res,
      offset: offsetNum,
      limit: limitNum,
      query,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Disclaimer' })
  @ApiBody({ type: CreateDisclaimerDto })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createDisclaimer(
    @Res() res: Response,
    @Body() body: CreateDisclaimerDto,
  ) {
    return await this.disclaimerService.createDisclaimer({ res, body });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Disclaimer' })
  @ApiBody({ type: UpdateDisclaimerDto })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:id')
  async updateDisclaimer(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: UpdateDisclaimerDto,
  ) {
    return await this.disclaimerService.updateDisclaimer({ res, id, body });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Disclaimer' })
  @ApiParam({ name: 'disclaimerId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:disclaimerId')
  async deleteDisclaimer(
    @Res() res: Response,
    @Param('disclaimerId') disclaimerId: string,
  ) {
    return await this.disclaimerService.deleteDisclaimer({
      res,
      disclaimerId,
    });
  }
}
