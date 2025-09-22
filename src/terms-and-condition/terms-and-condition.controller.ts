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
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { TermsAndConditionService } from './terms-and-condition.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition-policy.dto';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';

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
  @ApiBody({ type: CreateTermsAndConditionDto })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('/create')
  async createTermsAndCondition(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Body() body: CreateTermsAndConditionDto,
  ) {
    return await this.termsAndConditionService.createTermsAndCondition({
      file,
      res,
      body,
    });
  }

  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Terms and Condition (file upload)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'termsId', type: String, description: 'Terms ID' })
  @ApiBody({ type: UpdateTermsAndConditionDto })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Put('/update/:termsId')
  async updateTermsAndCondition(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param('termsId') termsId: string,
    @Body() body: UpdateTermsAndConditionDto,
  ) {
    return await this.termsAndConditionService.updateTermsAndCondition({
      file,
      res,
      body,
      termsId,
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
