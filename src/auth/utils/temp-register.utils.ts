// temp-register.utils.ts
import { BadRequestException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import axios, { AxiosError } from 'axios';
import { UserService } from 'src/user/user.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import {
  WhatsappErrorResponse,
  WhatsappResponseInterface,
} from 'src/auth/auth.service';
import { RedisService } from 'src/redis/redis.service';
import { TempRegisterDto } from '../dto/temp-register.dto';

export class TempCustomerRegisterUtils {
  static async verifyCustomerData(
    body: TempRegisterDto,
    userService: UserService,
  ) {
    const { mobile } = body;
    if (await userService.checkUserByMobile(mobile)) {
      throw new ConflictException(
        'User already exists with this mobile number',
      );
    }

    await userService.checkUserByEmailForAccount(body.email);
  }

  static uploadCustomerImages(
    fileUploadService: FileUploadService,
    imageRef: Express.Multer.File,
  ) {
    const uploadedImage = fileUploadService.handleSingleFileUpload({
      file: imageRef,
      body: { type: ImageTypeEnum.PROFILE },
    });

    return {
      imageUrl: uploadedImage.imageUrl,
      relativePath: uploadedImage.relativePath,
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

  static async cacheCustomerData(
    redisService: RedisService,
    body: TempRegisterDto,
  ) {
    const cacheKey = `reg:temp:${randomUUID()}`;
    await redisService.set(cacheKey, JSON.stringify(body), 600);
    return cacheKey;
  }
}
