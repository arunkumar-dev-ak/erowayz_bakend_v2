import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { FileUploadDto, ImageTypeEnum } from './dto/file-upload.dto';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/octet-stream',
    'text/html',
  ];
  private maxSize = 5 * 1024 * 1024; // 5MB

  private baseUploadPath =
    process.env.FILE_UPLOAD_PATH || path.resolve('./uploads');

  private generateUniqueFilename(originalName: string): string {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${uniqueSuffix}-${originalName}`;
  }

  private getUploadPath(type?: string): string {
    let uploadPath = path.join(this.baseUploadPath, 'general');
    if (type) {
      switch (type) {
        case 'profile':
          uploadPath = path.join(this.baseUploadPath, 'profiles');
          break;
        case 'license':
          uploadPath = path.join(this.baseUploadPath, 'license');
          break;
        case 'vendor':
          uploadPath = path.join(this.baseUploadPath, 'vendors');
          break;
        case 'shop':
          uploadPath = path.join(this.baseUploadPath, 'shops');
          break;
        case 'vendortype':
          uploadPath = path.join(this.baseUploadPath, 'vendortypes');
          break;
        case 'serviceOption':
          uploadPath = path.join(this.baseUploadPath, 'serviceOption');
          break;
        case 'category':
          uploadPath = path.join(this.baseUploadPath, 'category');
          break;
        case 'subCategory':
          uploadPath = path.join(this.baseUploadPath, 'subCategory');
          break;
        case 'item':
          uploadPath = path.join(this.baseUploadPath, 'item');
          break;
        case 'banner':
          uploadPath = path.join(this.baseUploadPath, 'banner');
          break;
        case 'bannerProduct':
          uploadPath = path.join(this.baseUploadPath, 'bannerProduct');
          break;
        case 'service':
          uploadPath = path.join(this.baseUploadPath, 'service');
          break;
        case 'bannerVendorItem':
          uploadPath = path.join(this.baseUploadPath, 'bannerVendorItem');
          break;
        case 'bankPaymentType':
          uploadPath = path.join(this.baseUploadPath, 'bankPaymentType');
          break;
        case 'bankName':
          uploadPath = path.join(this.baseUploadPath, 'bankName');
          break;
        case 'disclaimer':
          uploadPath = path.join(this.baseUploadPath, 'disclaimer');
          break;
        case 'privacyPolicy':
          uploadPath = path.join(this.baseUploadPath, 'privacyPolicy');
          break;
        case 'poster':
          uploadPath = path.join(this.baseUploadPath, 'poster');
          break;
        case 'termsAndCondition':
          uploadPath = path.join(this.baseUploadPath, 'termsAndCondition');
          break;
        case 'settlementImage':
          uploadPath = path.join(this.baseUploadPath, 'settlementImage');
          break;
      }
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    return uploadPath;
  }

  private validateFile(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }
    if (file.size > this.maxSize) {
      throw new BadRequestException('File is too large!');
    }
  }

  handleSingleFileUpload({
    file,
    body,
  }: {
    file: Express.Multer.File;
    body: FileUploadDto;
  }) {
    this.validateFile(file);

    const uploadPath = this.getUploadPath(body.type);
    // console.log(`upload path is ${uploadPath}`);
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const finalPath = `${uploadPath}/${uniqueFilename}`;
    // console.log(`finalPath is ${finalPath}`);
    //upload files
    if (!file.path && !file.buffer) {
      throw new Error('File path cannot be empty');
    }
    fs.renameSync(file.path || file.buffer, finalPath);
    const relativePath = path
      .relative('./uploads', finalPath)
      .replace(/\\/g, '/'); //in windows the file path is like C:\\project\\uploads
    // console.log(`relativePath is ${relativePath}`);
    const imageUrl = `${process.env.DOMAIN_URL || 'http://localhost:3000/'}client/${relativePath}`;
    return {
      imageUrl, //absolute URL
      relativePath: finalPath, //relative URL
    };
  }

  handleMultipleFileUpload({
    files,
    body,
  }: {
    files: Express.Multer.File[];
    body: FileUploadDto;
  }) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const uploadPath = this.getUploadPath(body.type || ImageTypeEnum.GENERAL);
    for (const file of files) {
      this.validateFile(file);
    }
    const uploadedFiles: { imageUrl: string; relativePath: string }[] = [];
    try {
      files.forEach((file) => {
        const uniqueFilename = this.generateUniqueFilename(file.originalname);
        const finalPath = `${uploadPath}/${uniqueFilename}`;
        fs.renameSync(file.path, finalPath);
        const relativePath = path
          .relative('./uploads', finalPath)
          .replace(/\\/g, '/');

        const imageUrl = `${process.env.DOMAIN_URL || 'http://localhost:3000/'}client/${relativePath}`;

        uploadedFiles.push({ imageUrl, relativePath: finalPath });
      });

      return {
        filePaths: uploadedFiles,
      };
    } catch (error) {
      uploadedFiles.forEach(({ relativePath }) => {
        if (fs.existsSync(relativePath)) {
          fs.unlinkSync(relativePath);
        }
      });

      throw error;
    }
  }

  handleSingleFileDeletion(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { message: 'File deleted successfully' };
      }
    } catch {
      return { message: 'Failed to delete file' };
    }
  }

  handleMultipleFileUploadWithDifferentPath({
    files,
    pathType,
  }: {
    files: Express.Multer.File[];
    pathType: ImageTypeEnum[];
  }) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles: { imageUrl: string; relativePath: string }[] = [];

    try {
      files.forEach((file, index) => {
        this.validateFile(file);
        const uploadPath = this.getUploadPath(
          pathType[index] || ImageTypeEnum.GENERAL,
        );
        const uniqueFilename = this.generateUniqueFilename(file.originalname);
        const finalPath = `${uploadPath}/${uniqueFilename}`;

        // Ensure file exists before renaming
        if (!file.path) {
          throw new Error('File path cannot be empty');
        }
        fs.renameSync(file.path, finalPath);

        // Convert to relative path for deletion
        const relativePath = path
          .relative('./uploads', finalPath)
          .replace(/\\/g, '/');
        // Absolute URL for frontend
        const imageUrl = `${process.env.DOMAIN_URL || 'http://localhost:3000/'}client/${relativePath}`;

        uploadedFiles.push({ imageUrl, relativePath: finalPath });
      });
      return {
        filePaths: uploadedFiles,
      };
    } catch (error) {
      uploadedFiles.forEach(({ relativePath }) => {
        if (fs.existsSync(relativePath)) {
          fs.unlinkSync(relativePath);
        }
      });

      throw error;
    }
  }
}
