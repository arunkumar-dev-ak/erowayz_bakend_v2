import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoinImageService } from './coin-image.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';

@Controller('coin-image')
export class CoinImageController {
  constructor(private readonly coinImageService: CoinImageService) {}

  @Get()
  async geCoinImage(@Res() res: Response) {
    return await this.coinImageService.getCoinImage({
      res,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('createOrUpdate')
  @UseInterceptors(FileInterceptor('image'))
  async createOrUpdate(
    @Res() res: Response,
    @UploadedFile() image: Express.Multer.File,
  ) {
    await this.coinImageService.createCoinImage({
      res,
      image,
    });
  }
}
