import { Prisma, TempRegister } from '@prisma/client';
import { TempRegisterDto } from '../dto/temp-register.dto';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TestRegisterDto } from '../dto/testregister.dto';
import { VerifyOtpInterface, WhatsappErrorResponse } from '../auth.service';
import axios, { AxiosError } from 'axios';
import { RedisService } from 'src/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { FileUploadService } from 'src/file-upload/file-upload.service';

export function areAnyBloodFieldsPresent(fields: {
  isDonor?: string;
  bloodGroup?: string;
  city?: string;
  area?: string;
}): boolean {
  return (
    fields.isDonor !== undefined ||
    fields.bloodGroup !== undefined ||
    fields.city !== undefined ||
    fields.area !== undefined
  );
}

export function areAllBloodFieldsPresent(fields: {
  isDonor?: string;
  bloodGroup?: string;
  city?: string;
  area?: string;
}): boolean {
  return (
    fields.isDonor !== undefined &&
    !!fields.bloodGroup &&
    !!fields.city &&
    !!fields.area
  );
}

export function buildBloodDetailsForRegister({
  body,
  userId,
}: {
  body: TempRegisterDto;
  userId: string;
}): Prisma.BloodDetailsCreateInput | undefined {
  const { isDonor, bloodGroup, city, area } = body;

  const bloodFields = { isDonor, bloodGroup, city, area };

  if (!areAnyBloodFieldsPresent(bloodFields)) {
    return undefined;
  }

  if (!areAllBloodFieldsPresent(bloodFields)) {
    throw new BadRequestException(
      'If any blood detail is provided, all fields (isDonor, bloodGroup, city, area) are required.',
    );
  }

  const data: Prisma.BloodDetailsCreateInput = {
    User: {
      connect: {
        id: userId,
      },
    },
    isDonor: TrueOrFalseMap[isDonor as keyof typeof TrueOrFalseMap],
    bloodGroup: bloodGroup!,
    city: city!,
    area: area!,
  };
  return data;
}

export function buildBloodDetailsForTestRegister({
  body,
  userId,
}: {
  body: TestRegisterDto;
  userId: string;
}): Prisma.BloodDetailsCreateInput | undefined {
  const { isDonor, bloodGroup, city, area } = body;

  const bloodFields = { isDonor, bloodGroup, city, area };

  if (!areAnyBloodFieldsPresent(bloodFields)) {
    return undefined;
  }

  if (!areAllBloodFieldsPresent(bloodFields)) {
    throw new BadRequestException(
      'If any blood detail is provided, all fields (isDonor, bloodGroup, city, area) are required.',
    );
  }

  const data: Prisma.BloodDetailsCreateInput = {
    User: {
      connect: {
        id: userId,
      },
    },
    isDonor: TrueOrFalseMap[isDonor as keyof typeof TrueOrFalseMap],
    bloodGroup: bloodGroup!,
    city: city!,
    area: area!,
  };
  return data;
}

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
    return plainToInstance(TempRegisterDto, JSON.parse(cachedValue));
  }

  static cleanupFiles(
    fileUploadService: FileUploadService,
    file?: string | null,
  ) {
    if (file) {
      fileUploadService.handleSingleFileDeletion(file);
    }
  }
}
