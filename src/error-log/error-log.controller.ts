import {
  Controller,
  Get,
  Put,
  Post,
  Res,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ErrorLogService } from './error-log.service';
import { UpdateErrorLogDto } from './dto/update-error-log.dto';
import { GetErrorLogQueryDto } from './dto/get-error-log.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { Response } from 'express';

@Controller('error-log')
export class ErrorLogController {
  constructor(private readonly errorLogService: ErrorLogService) {}

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Payment Error Logs (admin/sub_admin only)' })
  @UseGuards(AuthGuard, RoleGuard)
  @Get()
  async getErrorLogs(
    @Res() res: Response,
    @Query() query: GetErrorLogQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;

    return await this.errorLogService.getErrorLog({
      res,
      query,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a Payment Error Log (admin/sub_admin only)',
  })
  @ApiParam({ name: 'errorLogId', type: String, description: 'Error Log ID' })
  @ApiBody({
    description: 'Error Log update payload',
    type: UpdateErrorLogDto,
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UsePipes(new ValidationPipe())
  @Put('/update/:errorLogId')
  async updatePaymentErrorLog(
    @Res() res: Response,
    @Body() body: UpdateErrorLogDto,
    @Param('errorLogId') errorLogId: string,
  ) {
    return await this.errorLogService.updatePaymentError({
      res,
      body,
      errorLogId,
    });
  }

  @Roles(Role.ADMIN, Role.SUB_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload a file for payment error log (admin/sub_admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/upload-file')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    return await this.errorLogService.uploadFile({
      res,
      file,
    });
  }
}
