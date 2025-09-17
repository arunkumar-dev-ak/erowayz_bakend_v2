import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { VideoLinkService } from './video-link.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Video Link')
@Controller('video-link')
export class VideoLinkController {
  constructor(private readonly videoLinkService: VideoLinkService) {}

  @ApiOperation({ summary: 'Get all Video Links' })
  @Get()
  async getVideoLink(@Res() res: Response) {
    return await this.videoLinkService.getVideoLink({ res });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Video Link (upload a file)' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/create')
  async createVideoLink(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return await this.videoLinkService.createVideoLink({ file, res });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Video Link (upload a file)' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/update')
  async updateVideoLink(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return await this.videoLinkService.updateVideoLink({ file, res });
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
    return await this.videoLinkService.deleteVideoLink({
      videoLinkId,
      res,
    });
  }
}
