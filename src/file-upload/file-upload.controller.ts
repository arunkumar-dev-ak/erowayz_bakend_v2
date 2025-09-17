import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from './dto/file-upload.dto';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileUploadDto,
  ) {
    return this.fileUploadService.handleSingleFileUpload({ file, body });
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 3))
  uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: FileUploadDto,
  ) {
    return this.fileUploadService.handleMultipleFileUpload({ files, body });
  }
}
