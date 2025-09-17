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
  ];
  private maxSize = 5 * 1024 * 1024; // 5MB

  private generateUniqueFilename(originalName: string): string {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${uniqueSuffix}-${originalName}`;
  }

  private getUploadPath(type?: string): string {
    let uploadPath = './uploads/general';
    if (type) {
      switch (type) {
        case 'profile':
          uploadPath = './uploads/profiles';
          break;
        case 'license':
          uploadPath = './uploads/license';
          break;
        case 'vendor':
          uploadPath = './uploads/vendors';
          break;
        case 'shop':
          uploadPath = './uploads/shops';
          break;
        case 'vendortype':
          uploadPath = './uploads/vendortypes';
          break;
        case 'serviceOption':
          uploadPath = './uploads/serviceOption';
          break;
        case 'category':
          uploadPath = './uploads/category';
          break;
        case 'subCategory':
          uploadPath = './uploads/subCategory';
          break;
        case 'item':
          uploadPath = './uploads/item';
          break;
        case 'banner':
          uploadPath = './uploads/banner';
          break;
        case 'bannerProduct':
          uploadPath = './uploads/bannerProduct';
          break;
        case 'service':
          uploadPath = './uploads/service';
          break;
        case 'bannerVendorItem':
          uploadPath = './uploads/bannerVendorItem';
          break;
        case 'bankPaymentType':
          uploadPath = './uploads/bankPaymentType';
          break;
        case 'bankName':
          uploadPath = './uploads/bankName';
          break;
        case 'disclaimer':
          uploadPath = './uploads/disclaimer';
          break;
        case 'privacyPolicy':
          uploadPath = './uploads/privacyPolicy';
          break;
        case 'videoLink':
          uploadPath = './uploads/videoLink';
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
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const finalPath = `${uploadPath}/${uniqueFilename}`;
    //upload files
    if (!file.path && !file.buffer) {
      throw new Error('File path cannot be empty');
    }
    fs.renameSync(file.path || file.buffer, finalPath);
    const relativePath = path
      .relative('./uploads', finalPath)
      .replace(/\\/g, '/'); //in windows the file path is like C:\\project\\uploads

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
