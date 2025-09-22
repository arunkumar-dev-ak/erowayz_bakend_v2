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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PosterService } from './poster.service';
import { CreatePosterDto } from './dto/create-poster.dto';
import { UpdatePosterDto } from './dto/update-poster.dto';
import { GetPosterLinkQueryDto } from './dto/get-poster.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('poster')
export class PosterController {
  constructor(private readonly posterService: PosterService) {}

  @ApiOperation({ summary: 'Get Posters with filtering & pagination' })
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
  async getPosters(
    @Res() res: Response,
    @Query() query: GetPosterLinkQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.posterService.getPoster({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Poster' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Poster creation payload with file',
    type: CreatePosterDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe())
  @Post('/create')
  async createPoster(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePosterDto,
  ) {
    return await this.posterService.createPoster({
      res,
      file,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing Poster' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'posterId', type: String, description: 'Poster ID' })
  @ApiBody({
    description: 'Poster update payload with optional file',
    type: UpdatePosterDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/update/:posterId')
  async updatePoster(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdatePosterDto,
    @Param('posterId') posterId: string,
  ) {
    return await this.posterService.updatePoster({
      res,
      file,
      body,
      posterId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Poster' })
  @ApiParam({ name: 'posterId', type: String, description: 'Poster ID' })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:posterId')
  async deletePoster(
    @Res() res: Response,
    @Param('posterId') posterId: string,
  ) {
    return await this.posterService.deletePoster({
      res,
      posterId,
    });
  }
}
