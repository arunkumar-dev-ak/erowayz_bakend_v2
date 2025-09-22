import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Res,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { DisclaimerService } from './disclaimer.service';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateDiscalimerDto } from './dto/create-disclaimer.dto';
import { UpdateDiscalimerDto } from './dto/update-disclaimer.dto';

@Controller('disclaimer')
export class DisclaimerController {
  constructor(private readonly disclaimerService: DisclaimerService) {}

  @ApiOperation({ summary: 'Get all Disclaimers' })
  @Get()
  async getDisclaimer(@Res() res: Response) {
    return await this.disclaimerService.getDisclaimer({ res });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Disclaimer (with image)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('/create')
  async createDisclaimer(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDiscalimerDto,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return await this.disclaimerService.createDisclaimer({ res, file, body });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Disclaimer (replace image)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Put('/update/:id')
  async updateDisclaimer(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateDiscalimerDto,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return await this.disclaimerService.updateDisclaimer({ res, file, body });
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
