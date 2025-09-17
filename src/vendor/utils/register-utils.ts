// register.utils.ts
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { plainToInstance } from 'class-transformer';
import {
  VerifyOtpInterface,
  WhatsappErrorResponse,
} from 'src/auth/auth.service';
import { TempRegisterVendorDto } from '../dto/temp-registervendor.dto';
import { RedisService } from 'src/redis/redis.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Prisma, TempRegister } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export class RegisterUtils {
  static async verifyOtp(
    otp: string,
    existingOtp: TempRegister,
    otpVerifyUrl: string,
    signatureHash: string,
    integrationToken: string,
  ) {
    try {
      const response = await axios.post<VerifyOtpInterface>(
        otpVerifyUrl,
        {
          otp,
          sessionId: existingOtp.sessionId,
          signatureHash,
        },
        {
          headers: {
            'integration-token': `${integrationToken}`,
          },
        },
      );

      if (!response.data?.data.verified) {
        throw new UnauthorizedException('Invalid OTP');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsappErrorResponse>;
        if (axiosError.response?.data.message) {
          throw new BadRequestException(axiosError.response?.data?.message);
        }
      }
      throw new UnauthorizedException('OTP verification failed');
    }
  }

  static async getCachedVendorData(
    redisService: RedisService,
    cacheKey: string,
  ) {
    const cachedValue = await redisService.get(cacheKey);
    if (!cachedValue) {
      throw new BadRequestException(
        'Sorry for the inconvenience. Register data not found. Try again later',
      );
    }
    return plainToInstance(TempRegisterVendorDto, JSON.parse(cachedValue));
  }

  static cleanupFiles(
    fileUploadService: FileUploadService,
    files: (string | null)[],
  ) {
    for (const fileItem of files) {
      if (fileItem) {
        fileUploadService.handleSingleFileDeletion(fileItem);
      }
    }
  }

  static async buildVendorCreateData({
    parsedValue,
    existingOtp,
  }: {
    parsedValue: TempRegisterVendorDto;
    existingOtp: TempRegister;
  }) {
    const {
      licenseType,
      licenseNo,
      keyWordIds,
      expiryDate,
      mobile,
      name,
      nameTamil,
      email,
      vendorTypeId,
      paymentMethod,
      serviceOptionIds,
      password,
    } = parsedValue;

    const {
      profileAbsPath,
      profileRelPath,
      shopAbsPath,
      shopRelPath,
      licenseAbsPath,
      licenseRelPath,
    } = existingOtp;

    const licenseData =
      licenseNo && expiryDate
        ? {
            create: {
              licenseNo,
              expiryDate,
              ...(licenseType ? { licenseType } : {}),
              image: licenseAbsPath,
              relativeUrl: licenseRelPath,
            },
          }
        : undefined;

    const vendorCreateQuery: Prisma.UserCreateInput = {
      mobile,
      name: name,
      nameTamil: nameTamil,
      role: 'VENDOR',
      imageRef: profileAbsPath,
      relativeUrl: profileRelPath,
      email: email,
      password: password ? await bcrypt.hash(password, 10) : undefined,
      vendor: {
        create: {
          vendorTypeId: vendorTypeId,
          paymentMethod,
          shopInfo: {
            create: {
              name: parsedValue.shopName,
              address: parsedValue.address,
              city: parsedValue.city,
              pincode: parsedValue.pincode,
              latitude: parsedValue.latitude,
              longitude: parsedValue.longitude,
              shopImageRef: shopAbsPath,
              relativeUrl: shopRelPath,
              license: licenseData,
              nameTamil: parsedValue.shopNameTamil,
              addressTamil: parsedValue.addressTamil,
              shopType: parsedValue.shopType,
            },
          },
          ...(serviceOptionIds?.length
            ? {
                vendorServiceOption: {
                  createMany: {
                    data: serviceOptionIds.map((serviceOptionId) => ({
                      serviceOptionId,
                    })),
                  },
                },
              }
            : {}),
          ...(keyWordIds?.length
            ? {
                serviceVendorKeyword: {
                  createMany: {
                    data: keyWordIds.map((keywordId) => ({
                      keywordId,
                    })),
                  },
                },
              }
            : {}),
        },
      },
    };

    return { vendorCreateQuery };
  }
}
