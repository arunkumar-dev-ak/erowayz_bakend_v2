import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Param,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { VerifyBloodRequestDto } from './dto/verify-blood-request.dto';
import { FetchUserGuard } from 'src/common/guards/fetch-user.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { GetAdminBloodDetailQueryDto } from './dto/get-blood-detail-admin.dto';

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
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({ summary: 'Get all blood request' })
  @Get('blood-request')
  async getBloodRequest(
    @Res() res: Response,
    @Query() query: GetAdminBloodDetailQueryDto,
  ) {
    await this.bloodDetailsService.getBloodDetailRequest({
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
  @ApiConsumes('multipart/form-data', 'application/json')
  @Post('request/:bloodDetailId')
  @ApiParam({ name: 'bloodDetailId', type: String })
  @UseInterceptors(FileInterceptor('document'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async requestBloodDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bloodDetailId') bloodDetailId: string,
    @Body() body: RequestBloodDetailDto,
    @UploadedFile() document?: Express.Multer.File,
  ) {
    const currentUserId = extractUserIdFromRequest(req);
    await this.bloodDetailsService.requestBloodDetail({
      res,
      body,
      bloodDetailId,
      currentUserId,
      document,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({
    summary: 'Verify or reject a blood request document (Admin only)',
  })
  @ApiBody({ type: VerifyBloodRequestDto })
  @ApiParam({ name: 'id', type: String, description: 'BloodRequest ID' })
  @Patch('blood-request/:id/verify')
  @UsePipes(new ValidationPipe({ transform: true }))
  async verifyBloodRequest(
    @Res() res: Response,
    @Param('id') bloodRequestId: string,
    @Body() body: VerifyBloodRequestDto,
  ) {
    await this.bloodDetailsService.verifyBloodRequest({
      res,
      bloodRequestId,
      body,
    });
  }
}
