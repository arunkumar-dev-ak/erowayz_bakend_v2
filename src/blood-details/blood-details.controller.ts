import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { BloodDetailsService } from './blood-details.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetBloodDetailsQueryDto } from './dto/get-blood-details-query.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import {
  extractUserFromRequest,
  extractUserIdFromRequest,
} from 'src/common/functions/extractUserId';
import { RequestBloodDetailDto } from './dto/request-blood-details.dto';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';

@ApiTags('blood-details')
@Controller('blood-details')
export class BloodDetailsController {
  constructor(private readonly bloodDetailsService: BloodDetailsService) {}

  @ApiBearerAuth()
  @UseGuards(FetchUserGuard, AuthGuard)
  @ApiOperation({ summary: 'Get all blood details' })
  @Get()
  async getBloodDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetBloodDetailsQueryDto,
  ) {
    const user = extractUserFromRequest(req);
    await this.bloodDetailsService.getBloodDetail({
      userId: user?.id,
      res,
      query,
      offset: Number(query.offset || '0'),
      limit: Number(query.limit || '10'),
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update donor status for the current user' })
  @Put('donor-status')
  @UsePipes(new ValidationPipe())
  async updateDonorStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateDonorDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.bloodDetailsService.updateDonorStatus({
      res,
      body,
      userId,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Remove current user's blood detail" })
  @Delete('remove')
  async removeBloodDetail(@Req() req: Request, @Res() res: Response) {
    const userId = extractUserIdFromRequest(req);
    await this.bloodDetailsService.removeBloodDetail({ userId, res });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request blood from a donor' })
  @Post('request/:bloodDetailId')
  @ApiParam({ name: 'bloodDetailId', type: String })
  @UsePipes(new ValidationPipe())
  async requestBloodDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bloodDetailId') bloodDetailId: string,
    @Body() body: RequestBloodDetailDto,
  ) {
    const currentUserId = extractUserIdFromRequest(req);
    await this.bloodDetailsService.requestBloodDetail({
      res,
      body,
      bloodDetailId,
      currentUserId,
    });
  }
}
