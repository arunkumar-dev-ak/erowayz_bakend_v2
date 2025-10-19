import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { TokenService } from 'src/token/token.service';
import { TempRegisterVendorDto } from './dto/temp-registervendor.dto';
import { Response } from 'express';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { UserService } from 'src/user/user.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { TestRegisterVendorDto } from './dto/testregistervendor.dto';
import { v4 as uuidv4 } from 'uuid';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { TestVendorLoginDto } from 'src/auth/dto/testvendorlogin.dto';
import { Prisma, Role } from '@prisma/client';
import { MetadataService } from 'src/metadata/metadata.service';
import { KeywordService } from 'src/keyword/keyword.service';
import { ConfigService } from '@nestjs/config';
import {
  RegisterTestVendorVerification,
  TempRegisterVendorVerification,
} from './utils/temp-vendor.utils';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import {
  buildVendorUpdateInput,
  UpdateVendorVerification,
} from './utils/update-vendor.utils';
import { GetVendorQueryDto } from './dto/get-vendor-query.dto';
import {
  buildVendorWhereFilter,
  getVendorAvgRating,
  vendorInclude,
} from './utils/get-vendor.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { getReferralForRegistration } from 'src/common/functions/userfunctions';
import { GetHomePageQueryDto } from './dto/get-home-page-query.dto';
import {
  getHomePageUtils,
  getIncludeHomePageUtils,
} from './utils/get-home-page-query.utils';
import { FcmTokenService } from 'src/fcm-token/fcm-token.service';
import { GetVendorQueryForAdminDto } from './dto/get-vendor-admin-query.dto';
import {
  buildVendorForAdminWhereFilter,
  getIncludeVendorUtilsForAdmin,
} from './utils/get-vendor-for-admin.utils';
import { RedisService } from 'src/redis/redis.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { TempRegisterUtils } from './utils/temp-register.utils';
import { RegisterUtils } from './utils/register-utils';
import { LicenseCategoryService } from 'src/license-category/license-category.service';
import { ShopCategoryService } from 'src/shop-category/shop-category.service';
import { CityService } from 'src/city/city.service';
import { ReferralService } from 'src/referral/referral.service';

export interface MultipleFileUploadInterface {
  filePaths: ImageFiedlsInterface[];
}

export interface ImageFiedlsInterface {
  imageUrl: string;
  relativePath: string;
}

@Injectable()
export class VendorService {
  private WHATSAPP_OTP_REQUEST: string;
  private WHATSAPP_OTP_VERIFY: string;
  private WHATSAPP_SIGNATURE_HASH: string;
  private WHATSAPP_INTEGRATION_TOKEN: string;
  private REFERRAL_LIMIT: number;
  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly vendorTypeService: VendorTypeService,
    private readonly userService: UserService,
    private readonly fireBaseService: FirebaseService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
    private readonly keywordService: KeywordService,
    private readonly configService: ConfigService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly redisService: RedisService,
    private readonly licenseCategoryService: LicenseCategoryService,
    private readonly shopCategoryService: ShopCategoryService,
    private readonly shopCityService: CityService,
    private readonly referralService: ReferralService,
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
    this.REFERRAL_LIMIT = Number(
      configService.get<string>('REFERRAL_LIMIT') || '3',
    );
  }

  async getAllVendor({
    res,
    query,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    query: GetVendorQueryDto;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where = await buildVendorWhereFilter({
      query,
      offset,
      limit,
      prisma: this.prisma,
    });

    const totalCount = await this.prisma.vendor.count({ where });

    const include: Prisma.VendorInclude = vendorInclude(userId);

    const vendors = await this.prisma.vendor.findMany({
      where,
      skip: offset,
      take: limit,
      include,
      orderBy: {
        User: {
          status: 'desc',
        },
      },
    });

    const vendorWithRating = await getVendorAvgRating({
      vendors,
      prisma: this.prisma,
    });

    const queries = buildQueryParams({
      vendorCategoryType: query.vendorCategoryType,
      vendorName: query.vendorName,
      vendorStatus: query.vendorStatus,
      vendorTypeId: query.vendorTypeId,
      shopStatus: query.shopStatus,
      keywordIs: query.keywordId,
      longitude: query.latitude?.toString(),
      latitude: query.latitude?.toString(),
      serviceOptionId: query.serviceOptionId,
      vendorId: query.vendorId,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor/getAllVendors',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: vendorWithRating,
      meta,
      message: 'Vendor retrieved successfully',
      statusCode: 200,
    });
  }

  async getVendorForAdmin({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetVendorQueryForAdminDto;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where = buildVendorForAdminWhereFilter({
      query,
    });

    const totalCount = await this.prisma.vendor.count({ where });
    const include = getIncludeVendorUtilsForAdmin();

    const vendors = await this.prisma.vendor.findMany({
      where,
      skip: offset,
      take: limit,
      include,
      orderBy: [
        {
          User: {
            status: 'desc',
          },
        },
        {
          shopInfo: {
            license: {
              isLicenseApproved: 'asc',
            },
          },
        },
      ],
    });

    const { shopName, vendorName, licenseStatus } = query;
    const queries = buildQueryParams({ shopName, vendorName, licenseStatus });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor/getAllVendors/admin',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: vendors,
      meta,
      message: 'Vendor retrieved successfully',
      statusCode: 200,
    });
  }

  async getVendorForHomePage({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetHomePageQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { where } = getHomePageUtils({
      query,
    });
    const include = getIncludeHomePageUtils({ query });

    const totalCount = await this.prisma.vendor.count({ where });

    const vendors = await this.prisma.vendor.findMany({
      where,
      skip: offset,
      take: limit,
      include,
      orderBy: {
        User: {
          status: 'desc',
        },
      },
    });

    const queries = buildQueryParams({
      name: query.name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor/homePage',
      queries,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: vendors,
      meta,
      message: 'Vendor retrieved successfully',
      statusCode: 200,
    });
  }

  async getVendorByVendorId({
    res,
    vendorId,
  }: {
    res: Response;
    vendorId: string;
  }) {
    const initialDate = new Date();
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        vendorType: true,
        serviceVendorKeyword: {
          include: {
            keyword: true,
          },
        },
        vendorServiceOption: {
          include: { serviceOption: true },
        },
        User: {
          select: {
            id: true,
            name: true,
            nameTamil: true,
            imageRef: true,
            status: true,
            countryCode: true,
            mobile: true,
            email: true,
            referralCode: true,
          },
        },
        shopInfo: {
          include: {
            license: {
              include: {
                licenseCategory: true,
              },
            },
            shopCategory: true,
            shopCity: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }

    return this.response.successResponse({
      data: vendor,
      initialDate,
      res,
      message: 'Vendor fetched successfully',
      statusCode: 200,
    });
  }

  async getPopularVendor({
    res,
    offset,
    limit,
    userId,
  }: {
    res: Response;
    offset: number;
    limit: number;
    userId?: string;
  }) {
    const initialDate = new Date();

    const where: Prisma.VendorWhereInput = {
      User: {
        status: true,
      },
      shopInfo: {
        isShopOpen: true,
      },
      vendorType: {
        type: 'PRODUCT',
      },
    };
    const totalCount = await this.prisma.vendor.count({ where });

    const include: Prisma.VendorInclude = vendorInclude(userId);

    const vendors = await this.prisma.vendor.findMany({
      where,
      skip: offset,
      take: limit,
      include,
    });

    const vendorWithRating = await getVendorAvgRating({
      vendors,
      prisma: this.prisma,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'vendor/popular',
    });

    return this.response.successResponse({
      res,
      data: vendorWithRating,
      meta,
      message: 'Popular vendors retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async tempRegister({
    res,
    body,
    shopImageRef,
    vendorImageRef,
    licenseImageRef,
  }: {
    res: Response;
    body: TempRegisterVendorDto;
    shopImageRef: Express.Multer.File;
    vendorImageRef: Express.Multer.File;
    licenseImageRef: Express.Multer.File;
  }) {
    const initialDate = new Date();

    await TempRegisterUtils.verifyVendorData(
      body,
      this.vendorTypeService,
      this.licenseCategoryService,
      this.shopCategoryService,
      this.keywordService,
      this.shopCityService,
      this.userService,
      this,
      this.REFERRAL_LIMIT,
    );

    const {
      vendorImage,
      shopImage,
      licenseImage: uploadedLicenseImg,
    } = TempRegisterUtils.uploadVendorImages(
      this.fileUploadService,
      vendorImageRef,
      shopImageRef,
      licenseImageRef,
    );

    try {
      const { sessionId, expiresAt } =
        await TempRegisterUtils.requestWhatsappOtp(
          body.mobile,
          this.WHATSAPP_OTP_REQUEST,
          this.WHATSAPP_SIGNATURE_HASH,
          this.WHATSAPP_INTEGRATION_TOKEN,
        );

      if (body.referralCode) {
        await this.referralService.getSubInfoForReferral({
          referralCode: body.referralCode,
          isQueryNeeded: false,
        });
      }

      const cacheKey = await TempRegisterUtils.cacheVendorData(
        this.redisService,
        body,
      );

      const tempRegister = await this.prisma.tempRegister.create({
        data: {
          role: Role.VENDOR,
          cacheKey,
          expiresAt: new Date(expiresAt),
          sessionId,
          profileAbsPath: vendorImage.imageUrl,
          profileRelPath: vendorImage.relativePath,
          shopAbsPath: shopImage.imageUrl,
          shopRelPath: shopImage.relativePath,
          licenseAbsPath: uploadedLicenseImg.imageUrl,
          licenseRelPath: uploadedLicenseImg.relativePath,
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
      RegisterUtils.cleanupFiles(this.fileUploadService, [
        vendorImage.relativePath,
        shopImage.relativePath,
        uploadedLicenseImg.relativePath,
      ]);
      throw err;
    }
  }

  async RegisterVendor({
    res,
    body,
  }: {
    res: Response;
    body: RegisterVendorDto;
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

    // 2. Get cached vendor data
    const parsedValue = await RegisterUtils.getCachedVendorData(
      this.redisService,
      existingOtp.cacheKey,
    );

    try {
      // 3. Validate vendor-specific data
      await TempRegisterVendorVerification({
        body: parsedValue,
        vendorTypeService: this.vendorTypeService,
        keywordService: this.keywordService,
        userService: this.userService,
        vendorService: this,
        shopCategoryService: this.shopCategoryService,
        referralLimit: this.REFERRAL_LIMIT,
        shopCityService: this.shopCityService,
      });

      const { vendorCreateQuery } = await RegisterUtils.buildVendorCreateData({
        parsedValue,
        existingOtp,
      });

      let createVendorSub: Prisma.VendorSubscriptionCreateInput | undefined =
        undefined;

      if (parsedValue.referralCode) {
        const createQuery = await this.referralService.getSubInfoForReferral({
          referralCode: parsedValue.referralCode,
          isQueryNeeded: true,
        });
        createVendorSub = createQuery?.createVendorSubscriptionQuery;
      }

      if (!createVendorSub) {
        throw new BadRequestException('Referal code not found');
      }

      // 4. Create user & vendor inside a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: vendorCreateQuery,
          include: {
            vendor: { include: { shopInfo: true } },
          },
        });

        if (parsedValue.fcmToken) {
          await this.fcmTokenService.createFcmToken({
            tx,
            userId: newUser.id,
            token: parsedValue.fcmToken,
          });
        }

        await tx.$executeRaw`
        UPDATE "ShopInfo"
        SET "location" = ST_SetSRID(ST_MakePoint(${parsedValue.longitude}, ${parsedValue.latitude}), 4326)::geography
        WHERE "id" = ${newUser.vendor!.shopInfo!.id}
      `;

        const referralCode = await getReferralForRegistration(
          this.prisma,
          newUser.id,
        );

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
                vendorServiceOption: { include: { serviceOption: true } },
                serviceVendorKeyword: { include: { keyword: true } },
              },
            },
          },
        });

        if (createVendorSub) {
          await tx.vendorSubscription.create({
            data: {
              ...createVendorSub,
              referredVendor: { connect: { id: user.vendor!.id } },
            },
          });
        }

        const { accessToken, refreshToken } =
          await this.tokenService.generateTokenPair({
            userId: user.id,
            tx,
            salt: user.salt,
          });

        await tx.tempRegister.delete({
          where: {
            id: existingOtp.id,
          },
        });

        return { ...user, accessToken, refreshToken };
      });

      return this.response.successResponse({
        res,
        data: result,
        message: 'Vendor created successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      RegisterUtils.cleanupFiles(this.fileUploadService, [
        existingOtp.profileRelPath,
        existingOtp.shopRelPath,
        existingOtp.licenseRelPath,
      ]);
      throw err;
    }
  }

  async updateVendor({
    vendorId,
    userId,
    body,
    vendorImageRef,
    res,
  }: {
    userId: string;
    vendorId: string;
    body: UpdateVendorDto;
    vendorImageRef?: Express.Multer.File;
    res: Response;
  }) {
    const initialDate = new Date();

    const existingVendor = await this.findVendorByVendorId(vendorId);
    if (!existingVendor) {
      throw new BadRequestException('Vendor not exists');
    }

    if ((!body && !vendorImageRef) || Object.keys(body).length === 0) {
      throw new BadRequestException('No valid fields provided to update');
    }

    const { keyWordIds } = body;
    //verification
    const { activateQuery, inactivateQuery, createQuery } =
      await UpdateVendorVerification({
        vendorId,
        userId,
        body,
        vendorType: existingVendor.vendorType,
        vendorTypeService: this.vendorTypeService,
        keywordService: this.keywordService,
        userService: this.userService,
        vendorService: this,
      });

    let uploadedImage: ImageFiedlsInterface | undefined;
    //upload image
    if (vendorImageRef) {
      uploadedImage = this.fileUploadService.handleSingleFileUpload({
        file: vendorImageRef,
        body: { type: ImageTypeEnum.VENDOR },
      });
    }

    const vendorUpdateInput = buildVendorUpdateInput({
      body,
      uploadedImage,
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        //upload keywords
        if (keyWordIds) {
          await tx.serviceVendorKeyword.deleteMany({
            where: { vendorId },
          });
          await tx.serviceVendorKeyword.createMany({
            data: keyWordIds.map((keywordId) => ({ vendorId, keywordId })),
            skipDuplicates: true,
          });
        }
        //update vendorServiceOption
        if (inactivateQuery) {
          await tx.vendorServiceOption.updateMany(inactivateQuery);
        }
        if (activateQuery) {
          await tx.vendorServiceOption.updateMany(activateQuery);
        }
        if (createQuery) {
          await tx.vendorServiceOption.createMany(createQuery);
        }
        //update vendor
        const updatedVendor = await tx.vendor.update({
          where: {
            id: vendorId,
          },
          data: vendorUpdateInput,
          include: {
            vendorServiceOption: {
              include: {
                serviceOption: true,
              },
            },
            serviceVendorKeyword: {
              include: {
                keyword: true,
              },
            },
          },
        });

        return updatedVendor;
      });

      if (uploadedImage && existingVendor.User.relativeUrl) {
        this.fileUploadService.handleSingleFileDeletion(
          existingVendor.User.relativeUrl,
        );
      }

      return this.response.successResponse({
        initialDate,
        res,
        data: result,
        statusCode: 200,
        message: 'Vendor Updated successfully',
      });
    } catch (err) {
      // Rollback: Delete uploaded files if user creation fails
      if (uploadedImage) {
        this.fileUploadService.handleSingleFileDeletion(
          uploadedImage.relativePath,
        );
      }

      throw err;
    }
  }

  async logout({ res, token }: { res: Response; token: string }) {
    const initialDate = new Date();
    await this.prisma.$transaction(async (tx) => {
      await this.tokenService.revokeRefreshToken({ token, tx });
    });
    return this.response.successResponse({
      res,
      data: {},
      message: 'Vendor logged out successfully',
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
    });
    return this.response.successResponse({
      res,
      data: {},
      message: 'Vendor logged out on all devices successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async findVendorById({ id }: { id: string }) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        vendorType: true,
        shopInfo: {
          include: {
            license: true,
            shopCategory: true,
            shopCity: true,
          },
        },
      },
    });
    return vendor;
  }

  async testRegisterUser({
    res,
    body,
    shopImageRef,
    vendorImageRef,
    licenseImage,
  }: {
    res: Response;
    body: TestRegisterVendorDto;
    shopImageRef: Express.Multer.File;
    vendorImageRef: Express.Multer.File;
    licenseImage: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const {
      mobile,
      serviceOptionIds,
      licenseNo,
      expiryDate,
      keyWordIds,
      paymentMethod,
      licenseCategoryId,
      shopCategoryId,
    } = body;

    await RegisterTestVendorVerification({
      body,
      vendorTypeService: this.vendorTypeService,
      keywordService: this.keywordService,
      userService: this.userService,
      vendorService: this,
      shopCategoryService: this.shopCategoryService,
      shopCityService: this.shopCityService,
    });

    /*----- Uploading images -----*/
    const uploadedImage =
      this.fileUploadService.handleMultipleFileUploadWithDifferentPath({
        files: [vendorImageRef, shopImageRef, licenseImage],
        pathType: [
          ImageTypeEnum.VENDOR,
          ImageTypeEnum.SHOP,
          ImageTypeEnum.LICENSE,
        ],
      });

    const vendorImage = uploadedImage.filePaths[0] as ImageFiedlsInterface; // { imageUrl, relativePath }
    const shopImage = uploadedImage.filePaths[1] as ImageFiedlsInterface; // { imageUrl, relativePath }
    const uploadedLicenseImg = uploadedImage
      .filePaths[2] as ImageFiedlsInterface;
    const licenseData =
      licenseNo && expiryDate
        ? {
            create: {
              licenseNo,
              expiryDate,
              ...(licenseCategoryId ? { licenseCategoryId } : {}),
              image: uploadedLicenseImg.imageUrl,
              relativeUrl: uploadedLicenseImg.relativePath,
            },
          }
        : undefined;
    /*----- create user and vendor -----*/
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            mobile,
            name: body.name,
            role: 'VENDOR',
            imageRef: vendorImage.imageUrl,
            relativeUrl: vendorImage.relativePath,
            email: body.email,
            vendor: {
              create: {
                vendorTypeId: body.vendorTypeId,
                paymentMethod,
                shopInfo: {
                  create: {
                    name: body.shopName,
                    address: body.address,
                    shopCityId: body.shopCityId,
                    pincode: body.pincode,
                    latitude: body.latitude,
                    longitude: body.longitude,
                    shopImageRef: shopImage.imageUrl,
                    relativeUrl: shopImage.relativePath,
                    license: licenseData,
                    ...(shopCategoryId && { shopCategoryId }),
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
          },
          include: {
            vendor: {
              include: {
                shopInfo: {
                  include: {
                    shopCategory: true,
                    shopCity: true,
                  },
                },
              },
            },
          },
        });

        if (body.fcmToken) {
          await this.fcmTokenService.createFcmToken({
            tx,
            userId: newUser.id,
            token: body.fcmToken,
          });
        }

        // ST_MakePoint(long, lat) => creating geometry point
        // ST_SetSRID(..., 4326) => Sets the SRID (Spatial Reference System Identifier)
        //::geography => Casts the geometry into the geography type
        await tx.$executeRaw`
        UPDATE "ShopInfo"
        SET "location" = ST_SetSRID(ST_MakePoint(${body.longitude}, ${body.latitude}), 4326)::geography
        WHERE "id" = ${newUser.vendor!.shopInfo!.id}
        `;

        const referralCode = await getReferralForRegistration(
          this.prisma,
          newUser.id,
        );

        // 👇 Update user with referral code
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
                serviceVendorKeyword: {
                  include: {
                    keyword: true,
                  },
                },
              },
            },
          },
        });

        const { accessToken, refreshToken } =
          await this.tokenService.generateTokenPair({
            userId: user.id,
            tx,
            salt: user.salt,
          });

        return { accessToken, refreshToken, user };
      });

      return this.response.successResponse({
        res,
        data: result,
        message: 'Test Vendor created successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      // Rollback: Delete uploaded files if user creation fails
      for (const fileItem of uploadedImage.filePaths) {
        this.fileUploadService.handleSingleFileDeletion(fileItem.relativePath);
      }
      throw err;
    }
  }

  async TestLoginVendor({
    res,
    body,
  }: {
    res: Response;
    body: TestVendorLoginDto;
  }) {
    const initialDate = new Date();
    const { mobile } = body;
    if (!mobile) {
      throw new NotAcceptableException('Invalid Firebase token');
    }
    /*----- find user by mobile ------*/
    const user = await this.prisma.user.findFirst({
      where: { mobile },
      include: {
        vendor: { include: { shopInfo: { include: { license: true } } } },
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const { accessToken, refreshToken } =
        await this.tokenService.generateTokenPair({
          userId: user.id,
          tx,
          salt: user.salt,
        });
      return { accessToken, refreshToken };
    });

    return this.response.successResponse({
      res,
      data: { ...user, ...result },
      message: 'Vendor Login successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- helper func -----*/
  async findVendorByVendorId(vendorId: string) {
    return await this.prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
      include: {
        shopInfo: {
          include: {
            shopCategory: true,
            shopCity: true,
          },
        },
        User: true,
        vendorType: true,
      },
    });
  }

  async getVendorInfoByReferralId(referralId: string) {
    return await this.prisma.vendor.findFirst({
      where: {
        User: {
          referralCode: referralId,
        },
      },
      include: {
        User: true,
        referralsMade: true,
      },
    });
  }

  async getVendorByLicenseNo(licenseNo: string) {
    return await this.prisma.license.findUnique({
      where: {
        licenseNo,
      },
    });
  }

  async getVendorServiceOptionByVendor(vendorId: string) {
    return await this.prisma.vendorServiceOption.findMany({
      where: {
        vendorId,
      },
    });
  }
}
