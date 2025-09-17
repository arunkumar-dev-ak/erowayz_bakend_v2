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
import { TermsAndConditionService } from './terms-and-condition.service';
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

@ApiTags('Terms And Condition')
@Controller('terms-and-condition')
export class TermsAndConditionController {
  constructor(
    private readonly termsAndConditionService: TermsAndConditionService,
  ) {}

  @ApiOperation({ summary: 'Get all Terms and Conditions' })
  @Get()
  async getTermsAndCondition(@Res() res: Response) {
    return await this.termsAndConditionService.getTermsAndCondition({ res });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Terms and Condition (file upload)' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/create')
  async createTermsAndCondition(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return await this.termsAndConditionService.createTermsAndCondition({
      file,
      res,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Terms and Condition (file upload)' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Put('/update')
  async updateTermsAndCondition(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return await this.termsAndConditionService.updateTermsAndCondition({
      file,
      res,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Terms and Condition by ID' })
  @ApiParam({ name: 'termsAndConditionId', type: String })
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('/delete/:termsAndConditionId')
  async deleteTermsAndCondition(
    @Param('termsAndConditionId') termsAndConditionId: string,
    @Res() res: Response,
  ) {
    return await this.termsAndConditionService.deleteTermsAndCondition({
      termsAndConditionId,
      res,
    });
  }
}
