import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { PrivacyPolicyService } from './privacy-policy.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreatePrivacyPolicyDto } from './dto/create-privacy-policy.dto';
import { UpdatePrivacyPolicyDto } from './dto/update-privacy-policy.dto';

@ApiTags('Privacy Policy')
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @ApiOperation({ summary: 'Get all Privacy Policies' })
  @Get()
  async getPrivacyPolicy(@Res() res: Response) {
    return await this.privacyPolicyService.getPrivacyPolicy({ res });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Privacy Policy (only one allowed)' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/create')
  async createPrivacyPolicy(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePrivacyPolicyDto,
  ) {
    return await this.privacyPolicyService.createPrivacyPolicy({
      res,
      file,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Privacy Policy' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'privacyPolicyId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/update/:privacyPolicyId')
  async updatePrivacyPolicy(
    @Res() res: Response,
    @Param('privacyPolicyId') privacyPolicyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdatePrivacyPolicyDto,
  ) {
    return await this.privacyPolicyService.updatePrivacyPolicy({
      res,
      file,
      body,
      privacyPolicyId,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Privacy Policy by ID' })
  @ApiParam({ name: 'privacyPolicyId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:privacyPolicyId')
  async deletePrivacyPolicy(
    @Res() res: Response,
    @Param('privacyPolicyId') privacyPolicyId: string,
  ) {
    return await this.privacyPolicyService.deletePrivacyPolicy({
      res,
      privacyPolicyId,
    });
  }
}
