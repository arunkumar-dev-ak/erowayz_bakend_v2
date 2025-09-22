import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { VideoLinkService } from './video-link.service';
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
import { GetVideoQueryDto } from './dto/get-video-link.dto';
import { CreateVideoLinkDto } from './dto/create-video-link.dto';
import { UpdateVideoLinkDto } from './dto/update-video-link.dto';

@ApiTags('Video Link')
@Controller('video-link')
export class VideoLinkController {
  constructor(private readonly videoLinkService: VideoLinkService) {}

  @ApiOperation({ summary: 'Get all Video Links' })
  @Get()
  async getVideoLink(@Query() query: GetVideoQueryDto, @Res() res: Response) {
    // pass pagination values (default example)
    const offset = Number(query.offset ?? '0');
    const limit = Number(query.limit ?? '0');

    return await this.videoLinkService.getVideoLink({
      res,
      query,
      offset,
      limit,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Video Link' })
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/create')
  async createVideoLink(
    @Body() body: CreateVideoLinkDto,
    @Res() res: Response,
  ) {
    return await this.videoLinkService.createVideoLink({ body, res });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Video Link' })
  @ApiParam({ name: 'videoLinkId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Put('/update/:videoLinkId')
  async updateVideoLink(
    @Param('videoLinkId') videoLinkId: string,
    @Body() body: UpdateVideoLinkDto,
    @Res() res: Response,
  ) {
    return await this.videoLinkService.updateVideoLink({
      videoLinkId,
      body,
      res,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Video Link by ID' })
  @ApiParam({ name: 'videoLinkId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:videoLinkId')
  async deleteVideoLink(
    @Param('videoLinkId') videoLinkId: string,
    @Res() res: Response,
  ) {
    return await this.videoLinkService.deleteVideoLink({ videoLinkId, res });
  }
}
