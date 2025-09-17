import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PredefinedBannerService } from './predefined-banner.service';
import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/roles/roles.docorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreatePredefinedBannerDto } from './dto/create-predefined.dto';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdatePredefinedBannerDto } from './dto/update-predefined.dto';
import { ChangeStatusPredefinedBannerDto } from './dto/changestatus-predefined.dto';
import { extractFileFromReq } from 'src/common/functions/bannerfunctions';
import { GetItemQueryDto } from 'src/item/dto/get-item-query.dto';

@ApiTags('Predefined Banner')
@Controller('predefined-banner')
export class PredefinedBannerController {
  constructor(
    private readonly predefinedBannerService: PredefinedBannerService,
  ) {}

  @ApiOperation({ summary: 'Get predefined banners with optional filtering' })
  @Get()
  async getPredefinedBanner(
    @Res() res: Response,
    @Query() query: GetItemQueryDto,
  ) {
    const { offset = 0, limit = 10, ...filters } = query;
    return await this.predefinedBannerService.getAllPredefinedBanner({
      res,
      ...filters,
      offset: Number(offset),
      limit: Number(limit),
    });
  }

  @ApiParam({
    name: 'id',
    description: 'Prdefined banner id',
    required: true,
    type: String,
  })
  @Get('getById/:id')
  async getPredefinedBannerId(
    @Res() res: Response,
    @Param('id') bannerId: string,
  ) {
    return await this.predefinedBannerService.extractPredefinedBannerById({
      res,
      bannerId,
    });
  }

  @ApiOperation({ summary: 'Create a new predefined banner' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fgImage', maxCount: 1 },
      { name: 'bgImage', maxCount: 1 },
    ]),
  )
  @Post('create')
  async createPredefinedBanner(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreatePredefinedBannerDto,
    @UploadedFiles()
    files: {
      fgImage?: Express.Multer.File;
      bgImage?: Express.Multer.File;
    },
  ) {
    if (
      (!files.fgImage && !files.bgImage) ||
      (files.fgImage && files.bgImage)
    ) {
      throw new BadRequestException(
        'Either fgImage(Foreground Image) or bgImage(Background Image) is required',
      );
    }
    const userId = extractUserIdFromRequest(req);
    return await this.predefinedBannerService.createPredefinedBanner({
      res,
      userId,
      body,
      fgImage: files.fgImage,
      bgImage: files.bgImage,
    });
  }

  @ApiOperation({ summary: 'Update an existing predefined banner' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'bannerId', type: String, required: true })
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fgImage', maxCount: 1 },
      { name: 'bgImage', maxCount: 1 },
    ]),
  )
  @Put('update/:bannerId')
  async updatePredefinedBanner(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      fgImage?: Express.Multer.File[];
      bgImage?: Express.Multer.File[];
    },
    @Body() body: UpdatePredefinedBannerDto,
    @Param('bannerId') bannerId: string,
  ) {
    if (!req.body) {
      throw new BadRequestException('No fields are provided for update');
    }

    const fgImage: Express.Multer.File[] | undefined | null =
      extractFileFromReq({
        req,
        fieldName: 'fgImage',
        files,
      });
    const bgImage: Express.Multer.File[] | undefined | null =
      extractFileFromReq({
        req,
        fieldName: 'bgImage',
        files,
      });

    if (fgImage && bgImage) {
      throw new BadRequestException(
        'Only one of fgImage (Foreground Image) or bgImage (Background Image) can be provided',
      );
    } else if (
      fgImage === null &&
      (bgImage === null || bgImage === undefined)
    ) {
      throw new BadRequestException(
        'if fgImage is sended as null and bgImage must present',
      );
    } else if (bgImage === null && (fgImage == null || fgImage === undefined)) {
      throw new BadRequestException(
        'if bgImage is sended as null and fgImage must present',
      );
    }

    // Pass the files to the service method to handle the update
    return await this.predefinedBannerService.updatePredefinedBanner({
      bannerId,
      res,
      body,
      fgImage,
      bgImage,
    });
  }

  @ApiOperation({ summary: 'Change the status of a predefined banner' })
  @ApiBearerAuth()
  @ApiParam({ name: 'bannerId', type: String, required: true })
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('changeStatus/:bannerId')
  async changeStatus(
    @Res() res: Response,
    @Body() body: ChangeStatusPredefinedBannerDto,
    @Param('bannerId') bannerId: string,
  ) {
    return await this.predefinedBannerService.changePredefinedBannerStatus({
      res,
      body,
      bannerId,
    });
  }

  @ApiOperation({ summary: 'Delete a predefined banner' })
  @ApiBearerAuth()
  @ApiParam({ name: 'bannerId', type: String, required: true })
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('delete/:bannerId')
  async deletePredefinedBanner(
    @Res() res: Response,
    @Param('bannerId') bannerId: string,
  ) {
    return await this.predefinedBannerService.deletePredefinedBanner({
      res,
      bannerId,
    });
  }
}
