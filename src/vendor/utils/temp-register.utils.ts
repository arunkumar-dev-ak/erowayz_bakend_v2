// temp-register.utils.ts
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import axios, { AxiosError } from 'axios';
import { TempRegisterVendorDto } from '../dto/temp-registervendor.dto';
import { TempRegisterVendorVerification } from './temp-vendor.utils';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { KeywordService } from 'src/keyword/keyword.service';
import { UserService } from 'src/user/user.service';
import { VendorService } from '../vendor.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { ImageFiedlsInterface } from './update-vendor.utils';
import {
  WhatsappErrorResponse,
  WhatsappResponseInterface,
} from 'src/auth/auth.service';
import { RedisService } from 'src/redis/redis.service';

export class TempRegisterUtils {
  static async verifyVendorData(
    body: TempRegisterVendorDto,
    vendorTypeService: VendorTypeService,
    keywordService: KeywordService,
    userService: UserService,
    vendorService: VendorService,
    referralLimit: number,
  ) {
    await TempRegisterVendorVerification({
      body,
      vendorTypeService,
      keywordService,
      userService,
      vendorService,
      referralLimit,
    });
  }

  static uploadVendorImages(
    fileUploadService: FileUploadService,
    vendorImageRef: Express.Multer.File,
    shopImageRef: Express.Multer.File,
    licenseImage: Express.Multer.File,
  ) {
    const uploadedImage =
      fileUploadService.handleMultipleFileUploadWithDifferentPath({
        files: [vendorImageRef, shopImageRef, licenseImage],
        pathType: [
          ImageTypeEnum.VENDOR,
          ImageTypeEnum.SHOP,
          ImageTypeEnum.LICENSE,
        ],
      });

    return {
      vendorImage: uploadedImage.filePaths[0] as ImageFiedlsInterface,
      shopImage: uploadedImage.filePaths[1] as ImageFiedlsInterface,
      licenseImage: uploadedImage.filePaths[2] as ImageFiedlsInterface,
    };
  }

  static async requestWhatsappOtp(
    mobile: string,
    otpRequestUrl: string,
    signatureHash: string,
    integrationToken: string,
  ) {
    try {
      const whatsappResponse = await axios.post<WhatsappResponseInterface>(
        otpRequestUrl,
        {
          phoneNumber: `+91${mobile}`,
          signatureHash,
        },
        {
          headers: {
            'integration-token': `${integrationToken}`,
          },
        },
      );

      const { sessionId, expiresAt } = whatsappResponse.data.data;

      if (!sessionId || !expiresAt) {
        throw new Error('Failed to get Otp from whatsapp');
      }

      return { sessionId, expiresAt };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsappErrorResponse>;
        if (axiosError.response?.data.message) {
          throw new BadRequestException(axiosError.response?.data?.message);
        }
      }
      throw new BadRequestException('Failed to send OTP via WhatsApp');
    }
  }

  static async cacheVendorData(
    redisService: RedisService,
    body: TempRegisterVendorDto,
  ) {
    const cacheKey = `reg:temp:${randomUUID()}`;
    await redisService.set(cacheKey, JSON.stringify(body), 600);
    return cacheKey;
  }
}
