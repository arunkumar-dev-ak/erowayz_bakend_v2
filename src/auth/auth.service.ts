import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { TempRegisterDto } from './dto/temp-register.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { LoginDto } from './dto/login.dto';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { TestRegisterDto } from './dto/testregister.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { Role, User } from '@prisma/client';
import { getReferralForRegistration } from 'src/common/functions/userfunctions';
import {
  buildBloodDetailsForRegister,
  buildBloodDetailsForTestRegister,
  RegisterUtils,
} from './utils/register.utils';
import { FcmTokenService } from 'src/fcm-token/fcm-token.service';
import { RefreshTokenDto } from './dto/logout.dto';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { TempCustomerRegisterUtils } from './utils/temp-register.utils';
import { RedisService } from 'src/redis/redis.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import * as bcrypt from 'bcryptjs';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResendOtpUtils } from './utils/resend-otp.utils';

export interface WhatsappOTPData {
  sessionId: string;
  expiresAt: string;
  clientType: string;
  phoneNumber: string;
  metadata?: {
    originalSessionId: string;
    phoneNumber: string;
    requestTime: string;
  };
}

export interface WhatsappResponseInterface {
  status: string;
  message: string;
  data: WhatsappOTPData;
  timestamp: string;
}

export interface VerifyOtpInterface {
  status: 'success' | 'error';
  message: string;
  data: {
    verified: boolean;
    phoneNumber: string;
  };
  timestamp: string; // ISO 8601 format
}

export interface WhatsappErrorResponse {
  status: boolean;
  message: string;
  statusCode: number;
  errors: unknown;
}

@Injectable()
export class AuthService {
  private WHATSAPP_OTP_REQUEST: string;
  private WHATSAPP_OTP_VERIFY: string;
  private WHATSAPP_SIGNATURE_HASH: string;
  private WHATSAPP_INTEGRATION_TOKEN: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly fireBaseService: FirebaseService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly redisService: RedisService,
  ) {
    this.WHATSAPP_OTP_REQUEST = configService.get<string>(
      'WHATSAPP_OTP_REQUEST',
    )!;
    this.WHATSAPP_OTP_VERIFY = configService.get<string>(
      'WHATSAPP_OTP_VERIFY',
    )!;
    this.WHATSAPP_SIGNATURE_HASH = configService.get<string>(
      'WHATSAPP_SIGNATURE_HASH',
    )!;
    this.WHATSAPP_INTEGRATION_TOKEN = configService.get<string>(
      'WHATSAPP_INTEGRATION_TOKEN',
    )!;
  }

  async tempRegister({
    res,
    body,
    imageRef,
  }: {
    res: Response;
    body: TempRegisterDto;
    imageRef: Express.Multer.File;
  }) {
    const initialDate = new Date();

    await TempCustomerRegisterUtils.verifyCustomerData(body, this.userService);

    let imageUrl: string | undefined;
    let relativePath: string | undefined;

    if (imageRef) {
      const uploadedImage = TempCustomerRegisterUtils.uploadCustomerImages(
        this.fileUploadService,
        imageRef,
      );

      imageUrl = uploadedImage.imageUrl;
      relativePath = uploadedImage.relativePath;
    }

    try {
      const { sessionId, expiresAt } =
        await TempCustomerRegisterUtils.requestWhatsappOtp(
          body.mobile,
          this.WHATSAPP_OTP_REQUEST,
          this.WHATSAPP_SIGNATURE_HASH,
          this.WHATSAPP_INTEGRATION_TOKEN,
        );

      const cacheKey = await TempCustomerRegisterUtils.cacheCustomerData(
        this.redisService,
        body,
      );

      const tempRegister = await this.prisma.tempRegister.create({
        data: {
          role: Role.CUSTOMER,
          cacheKey,
          expiresAt: new Date(expiresAt),
          sessionId,
          profileAbsPath: imageUrl,
          profileRelPath: relativePath,
        },
        select: { id: true },
      });

      return this.response.successResponse({
        res,
        data: tempRegister,
        message: 'Otp sent successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      RegisterUtils.cleanupFiles(this.fileUploadService, relativePath);
      throw err;
    }
  }

  async RegisterCustomer({
    res,
    body,
  }: {
    res: Response;
    body: RegisterCustomerDto;
  }) {
    const initialDate = new Date();
    const { otp, otpId } = body;

    const existingOtp = await this.prisma.tempRegister.findUnique({
      where: { id: otpId },
    });

    if (!existingOtp || existingOtp.status !== 'PENDING') {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // 1. Verify OTP
    await RegisterUtils.verifyOtp(
      otp,
      existingOtp,
      this.WHATSAPP_OTP_VERIFY,
      this.WHATSAPP_SIGNATURE_HASH,
      this.WHATSAPP_INTEGRATION_TOKEN,
    );

    try {
      // 2. Get cached vendor data
      const parsedValue = await RegisterUtils.getCachedVendorData(
        this.redisService,
        existingOtp.cacheKey,
      );

      const { name, mobile, email, nameTamil, fcmToken, password } =
        parsedValue;

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create user
        const newUser = await tx.user.create({
          data: {
            name,
            mobile,
            imageRef: existingOtp.profileAbsPath,
            relativeUrl: existingOtp.profileRelPath,
            email,
            nameTamil,
            password: password ? await bcrypt.hash(password, 10) : undefined,
          },
        });

        // 2. Create blood details
        const bloodDetailsInput = buildBloodDetailsForRegister({
          body: parsedValue,
          userId: newUser.id,
        });

        if (bloodDetailsInput) {
          await tx.bloodDetails.create({ data: bloodDetailsInput });
        }

        // 3. Generate tokens
        const { accessToken, refreshToken } =
          await this.tokenService.generateTokenPair({
            userId: newUser.id,
            tx,
            salt: newUser.salt,
          });

        // 4. Referral code update
        const referralCode = await getReferralForRegistration(
          this.prisma,
          newUser.id,
        );

        // 5. Update user with referral code and return user
        const user = await tx.user.update({
          where: { id: newUser.id },
          data: { referralCode },
          include: {
            vendor: {
              include: {
                shopInfo: {
                  include: {
                    shopCategory: true,
                    shopCity: true,
                  },
                },
                vendorServiceOption: {
                  include: {
                    serviceOption: true,
                  },
                },
                vendorType: true,
              },
            },
            bloodDetails: true,
          },
        });

        //6.create fcmToken
        if (fcmToken) {
          await this.fcmTokenService.createFcmToken({
            tx,
            userId: user.id,
            token: fcmToken,
          });
        }

        await tx.tempRegister.delete({
          where: {
            id: existingOtp.id,
          },
        });

        return { user, accessToken, refreshToken };
      });

      return this.response.successResponse({
        res,
        data: result,
        message: 'User created successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      RegisterUtils.cleanupFiles(
        this.fileUploadService,
        existingOtp.profileRelPath,
      );
      throw err;
    }
  }

  async loginUser({ res, body }: { res: Response; body: LoginDto }) {
    const initialDate = new Date();
    const { mobile } = body;

    /*----- find user by mobile ------*/
    const user = await this.prisma.user.findFirst({
      where: { mobile },
      include: {
        vendor: {
          include: {
            shopInfo: {
              include: {
                license: true,
                shopCategory: true,
                shopCity: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let sessionId: string;
    let expiresAt: string;

    try {
      const whatsappResponse = await axios.post<WhatsappResponseInterface>(
        this.WHATSAPP_OTP_REQUEST,
        {
          phoneNumber: `${user.countryCode}${user.mobile}`,
          signatureHash: this.WHATSAPP_SIGNATURE_HASH,
        },
        {
          headers: {
            'integration-token': `${this.WHATSAPP_INTEGRATION_TOKEN}`,
          },
        },
      );

      const data = whatsappResponse.data.data;

      sessionId = data.sessionId;
      expiresAt = data.expiresAt;

      if (!sessionId || !expiresAt) {
        throw new Error('Failed to get Otp from whatsapp');
      }
    } catch (error) {
      console.log(`error from whatsapp request otp ${error}`);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsappErrorResponse>;
        if (axiosError.response?.data.message) {
          throw new BadRequestException(axiosError.response?.data?.message);
        }
      }
      throw new BadRequestException('Failed to send OTP via WhatsApp');
    }

    const result = await this.prisma.oTP.create({
      data: {
        sessionId,
        userId: user.id,
        role: user.role,
        expiresAt: new Date(expiresAt),
        status: 'PENDING',
        fcmToken: body?.fcmToken,
      },
      select: {
        id: true,
      },
    });

    return this.response.successResponse({
      res,
      data: result,
      message: 'Otp sended successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async resendOtp({ res, body }: { res: Response; body: ResendOtpDto }) {
    const initialDate = new Date();

    const { otpId, type } = body;
    let updatedOtp;

    if (type === 'Login') {
      const existingOtp = await this.prisma.oTP.findUnique({
        where: {
          id: otpId,
        },
        include: {
          user: true,
        },
      });

      if (!existingOtp || !existingOtp.user.mobile) {
        throw new BadRequestException(
          'Cache data not found. Please try again by Login one more time.',
        );
      }

      const { sessionId, expiresAt } = await ResendOtpUtils(
        existingOtp.user.mobile,
        this.WHATSAPP_OTP_REQUEST,
        this.WHATSAPP_SIGNATURE_HASH,
        this.WHATSAPP_INTEGRATION_TOKEN,
      );

      updatedOtp = await this.prisma.oTP.update({
        where: {
          id: existingOtp.id,
        },
        data: {
          sessionId,
          expiresAt,
        },
        select: {
          id: true,
        },
      });
    } else {
      const tempRegister = await this.prisma.tempRegister.findUnique({
        where: {
          id: otpId,
        },
      });

      if (!tempRegister) {
        throw new BadRequestException(
          'Cache data not found. Please try again by Register one more time.',
        );
      }

      const parsedValue = await RegisterUtils.getCachedVendorData(
        this.redisService,
        tempRegister.cacheKey,
      );

      const { mobile } = parsedValue;

      const { sessionId, expiresAt } = await ResendOtpUtils(
        mobile,
        this.WHATSAPP_OTP_REQUEST,
        this.WHATSAPP_SIGNATURE_HASH,
        this.WHATSAPP_INTEGRATION_TOKEN,
      );

      updatedOtp = await this.prisma.tempRegister.update({
        where: {
          id: tempRegister.id,
        },
        data: {
          sessionId,
          expiresAt,
        },
        select: {
          id: true,
        },
      });
    }

    return this.response.successResponse({
      res,
      data: updatedOtp,
      message: 'Otp Resended successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async verifyOtp({ res, body }: { res: Response; body: VerifyOtpDto }) {
    const initialDate = new Date();
    const { otp, otpId } = body;

    // 1. Check if OTP record exists and is still pending
    const existingOtp = await this.prisma.oTP.findUnique({
      where: { id: otpId },
      include: { user: true },
    });

    if (!existingOtp || existingOtp.status !== 'PENDING') {
      throw new BadRequestException('Invalid or expired OTP');
    }
    if (!existingOtp.user.mobile) {
      throw new BadRequestException('User Not found');
    }

    const user = await this.userService.checkUserByMobile(
      existingOtp.user.mobile,
    );
    if (!user) {
      throw new BadRequestException('user not found');
    }

    // 2. Trigger WhatsApp OTP verification
    try {
      const response = await axios.post<VerifyOtpInterface>(
        this.WHATSAPP_OTP_VERIFY,
        {
          otp,
          sessionId: existingOtp.sessionId,
          signatureHash: this.WHATSAPP_SIGNATURE_HASH,
        },
        {
          headers: {
            'integration-token': `${this.WHATSAPP_INTEGRATION_TOKEN}`,
          },
        },
      );

      const isVerified = response.data?.data.verified;
      if (!isVerified) {
        throw new UnauthorizedException('Invalid OTP');
      }
    } catch (error) {
      console.log(`error from whatsapp verify otp ${error}`);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<WhatsappErrorResponse>;
        if (axiosError.response?.data.message) {
          throw new BadRequestException(axiosError.response?.data?.message);
        }
      }
      throw new UnauthorizedException('OTP verification failed');
    }

    // 3. Mark Otp as verified
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.oTP.update({
        where: { id: otpId },
        data: { status: 'VERIFIED' },
      });

      const { accessToken, refreshToken } =
        await this.tokenService.generateTokenPair({
          userId: user.id,
          tx,
          salt: user.salt,
        });

      if (existingOtp.fcmToken) {
        await this.fcmTokenService.createFcmToken({
          tx,
          userId: user.id,
          token: existingOtp.fcmToken,
        });
      }

      return { accessToken, refreshToken };
    });

    // 4. Return final success response
    return this.response.successResponse({
      res,
      statusCode: 200,
      message: 'OTP verified successfully',
      data: {
        user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      initialDate,
    });
  }

  async getAccessByRefreshToken({
    res,
    user,
    token,
  }: {
    res: Response;
    user: User;
    token: string;
  }) {
    const initialDate = new Date();
    //generate new token pair
    const result = await this.prisma.$transaction(async (tx) => {
      const { accessToken, refreshToken } =
        await this.tokenService.generateTokenPair({
          userId: user.id,
          tx,
          salt: user.salt,
        });
      await this.tokenService.revokeRefreshToken({ token, tx });
      return { accessToken, refreshToken };
    });

    return this.response.successResponse({
      res,
      data: { ...user, ...result },
      message: 'Access token generated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async logout({ res, body }: { res: Response; body: RefreshTokenDto }) {
    const token = body.refreshToken;
    const initialDate = new Date();
    await this.prisma.$transaction(async (tx) => {
      await this.tokenService.revokeRefreshToken({ token, tx });

      if (body.fcmToken) {
        await this.fcmTokenService.deleteFcmToken({
          tx,
          token: body.fcmToken,
        });
      }
    });
    return this.response.successResponse({
      res,
      data: {},
      message: 'User logged out successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async logoutOnAllDevice({ res, userId }: { res: Response; userId: string }) {
    const initialDate = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          salt: uuidv4(),
        },
      });
      await this.tokenService.revokeAllUserRefreshTokens({ userId, tx });
      await this.fcmTokenService.deleteFcmTokenByUserId({
        tx,
        userId,
      });
    });
    return this.response.successResponse({
      res,
      data: {},
      message: 'User logged out on all devices successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async testRegister({
    res,
    body,
    imageRef,
  }: {
    res: Response;
    body: TestRegisterDto;
    imageRef?: Express.Multer.File;
  }) {
    const { name, mobile, email } = body;
    const initialDate = new Date();

    if (await this.userService.checkUserByMobile(mobile)) {
      throw new ConflictException(
        'User already exists with this mobile number',
      );
    }

    await this.userService.checkUserByEmailForAccount(body.email);

    let imageUrl: string | undefined;
    let relativePath: string | undefined;

    if (imageRef) {
      const uploadedImage = this.fileUploadService.handleSingleFileUpload({
        file: imageRef,
        body: { type: ImageTypeEnum.PROFILE },
      });

      imageUrl = uploadedImage.imageUrl;
      relativePath = uploadedImage.relativePath;
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create user
        const newUser = await tx.user.create({
          data: {
            name,
            mobile,
            imageRef: imageUrl,
            relativeUrl: relativePath,
            email,
          },
        });

        // 2. Create blood details
        const bloodDetailsInput = buildBloodDetailsForTestRegister({
          body,
          userId: newUser.id,
        });

        if (bloodDetailsInput) {
          await tx.bloodDetails.create({ data: bloodDetailsInput });
        }

        // 3. Generate tokens
        const { accessToken, refreshToken } =
          await this.tokenService.generateTokenPair({
            userId: newUser.id,
            tx,
            salt: newUser.salt,
          });

        // 4. Referral code update
        const referralCode = await getReferralForRegistration(
          this.prisma,
          newUser.id,
        );

        // 5. Update user with referral code and return user
        const user = await tx.user.update({
          where: { id: newUser.id },
          data: { referralCode },
          include: {
            vendor: {
              include: {
                shopInfo: {
                  include: {
                    shopCity: true,
                    shopCategory: true,
                  },
                },
                vendorServiceOption: {
                  include: {
                    serviceOption: true,
                  },
                },
                vendorType: true,
              },
            },
            bloodDetails: true,
          },
        });

        //6.create fcmToken
        if (body.fcmToken) {
          await this.fcmTokenService.createFcmToken({
            tx,
            userId: user.id,
            token: body.fcmToken,
          });
        }

        return { user, accessToken, refreshToken };
      });

      return this.response.successResponse({
        res,
        data: result,
        message: 'TestUser created successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (relativePath) {
        this.fileUploadService.handleSingleFileDeletion(relativePath);
      }
      throw err;
    }
  }
}
