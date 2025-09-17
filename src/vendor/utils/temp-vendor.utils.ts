import { KeywordService } from 'src/keyword/keyword.service';
import { TestRegisterVendorDto } from '../dto/testregistervendor.dto';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { VendorService } from '../vendor.service';
import { KeyWordType, VendorCategoryType, VendorType } from '@prisma/client';
import { TempRegisterVendorDto } from '../dto/temp-registervendor.dto';

/*----- register -----*/
export const TempRegisterVendorVerification = async ({
  body,
  keywordService,
  vendorTypeService,
  userService,
  vendorService,
  referralLimit,
}: {
  body: TempRegisterVendorDto;
  keywordService: KeywordService;
  vendorTypeService: VendorTypeService;
  userService: UserService;
  vendorService: VendorService;
  referralLimit: number;
}) => {
  const {
    serviceOptionIds,
    vendorTypeId,
    keyWordIds,
    licenseNo,
    email,
    shopType,
    mobile,
    referralId,
  } = body;

  const [userByMobile, vendorType, licenseCheck, referralInfo] =
    await Promise.all([
      mobile ? userService.checkUserByMobile(mobile) : null,
      vendorTypeService.findVendorTypeById(vendorTypeId),
      vendorService.getVendorByLicenseNo(licenseNo),
      userService.checkUserByEmailForAccount(email),
      referralId ? vendorService.getVendorInfoByReferralId(referralId) : null,
    ]);

  validateUserByMobile(userByMobile);
  validateVendorType(vendorType);
  validateLicenseNumber(licenseCheck);

  // if (referralId) {
  //   if (!referralInfo) throw new BadRequestException('Referral Code Not found');

  //   const referrals = referralInfo.referralsMade;

  //   if (referrals.length === 0) {
  //     throw new BadRequestException(
  //       'This referral code has not referred anyone yet',
  //     );
  //   }
  // }

  if (!vendorType) {
    throw new BadRequestException('Invalid vendor type');
  }

  if (vendorType.type === VendorCategoryType.SERVICE) {
    await validateKeywordsForServiceVendor({
      keyWordIds,
      vendorType,
      keywordService,
    });
  } else if (keyWordIds) {
    throw new BadRequestException(
      `Keywords are not required for ${vendorType.name}`,
    );
  }

  if (vendorType.type === VendorCategoryType.PRODUCT) {
    await validateServiceOptionsForProductVendor({
      serviceOptionIds,
      vendorTypeId,
      vendorType,
      vendorTypeService,
    });
  } else if (serviceOptionIds) {
    throw new BadRequestException(
      `Service Options are not needed for ${vendorType.name}`,
    );
  }

  if (vendorType.type === VendorCategoryType.SERVICE) {
    await validateKeywordsForServiceVendor({
      keyWordIds,
      vendorType,
      keywordService,
    });
  } else if (keyWordIds) {
    throw new BadRequestException(
      `Keywords are not required for ${vendorType.name}`,
    );
  }

  //checking shopType
  if (
    (vendorType.type === VendorCategoryType.PRODUCT && !shopType) ||
    (vendorType.type !== VendorCategoryType.PRODUCT && shopType)
  ) {
    throw new BadRequestException(
      'Shop type is required only when the vendor category is Street Food, and must not be provided for other categories.',
    );
  }
};

/*----- Test register -----*/
export const RegisterTestVendorVerification = async ({
  body,
  keywordService,
  vendorTypeService,
  userService,
  vendorService,
}: {
  body: TestRegisterVendorDto;
  keywordService: KeywordService;
  vendorTypeService: VendorTypeService;
  userService: UserService;
  vendorService: VendorService;
}) => {
  const {
    serviceOptionIds,
    vendorTypeId,
    keyWordIds,
    mobile,
    licenseNo,
    email,
    shopType,
  } = body;

  const [userByMobile, vendorType, licenseCheck] = await Promise.all([
    mobile ? userService.checkUserByMobile(mobile) : null,
    vendorTypeService.findVendorTypeById(vendorTypeId),
    vendorService.getVendorByLicenseNo(licenseNo),
    userService.checkUserByEmailForAccount(email),
  ]);

  validateUserByMobile(userByMobile);
  validateVendorType(vendorType);
  validateLicenseNumber(licenseCheck);

  if (!vendorType) {
    throw new BadRequestException('Invalid vendor type');
  }

  // Now TypeScript knows vendorType is not null
  if (vendorType.type === VendorCategoryType.SERVICE) {
    await validateKeywordsForServiceVendor({
      keyWordIds,
      vendorType,
      keywordService,
    });
  } else if (keyWordIds) {
    throw new BadRequestException(
      `Keywords are not required for ${vendorType.name}`,
    );
  }

  if (vendorType.type === VendorCategoryType.PRODUCT) {
    await validateServiceOptionsForProductVendor({
      serviceOptionIds,
      vendorTypeId,
      vendorType,
      vendorTypeService,
    });
  } else if (serviceOptionIds) {
    throw new BadRequestException(
      `Service Options are not needed for ${vendorType.name}`,
    );
  }

  if (vendorType.type === VendorCategoryType.SERVICE) {
    await validateKeywordsForServiceVendor({
      keyWordIds,
      vendorType,
      keywordService,
    });
  } else if (keyWordIds) {
    throw new BadRequestException(
      `Keywords are not required for ${vendorType.name}`,
    );
  }

  //checking shopType
  if (
    (vendorType.type === VendorCategoryType.PRODUCT && !shopType) ||
    (vendorType.type !== VendorCategoryType.PRODUCT && shopType)
  ) {
    throw new BadRequestException(
      'Shop type is required only when the vendor category is Street Food, and must not be provided for other categories.',
    );
  }
};

function validateUserByMobile(userByMobile: any) {
  if (userByMobile) {
    throw new ConflictException('User already exists with this mobile number');
  }
}

function validateVendorType(vendorType: any) {
  if (!vendorType) {
    throw new BadRequestException('Invalid vendor type');
  }
}

function validateLicenseNumber(licenseCheck: any) {
  if (licenseCheck) {
    throw new BadRequestException('License number is used by another vendor');
  }
}

async function validateServiceOptionsForProductVendor({
  serviceOptionIds,
  vendorTypeId,
  vendorType,
  vendorTypeService,
}: {
  serviceOptionIds?: string[];
  vendorTypeId: string;
  vendorType: VendorType;
  vendorTypeService: VendorTypeService;
}) {
  if (!serviceOptionIds || serviceOptionIds.length === 0) {
    throw new BadRequestException(
      `Service Options are required for ${vendorType.name}`,
    );
  }

  const validCount = await vendorTypeService.findServiceCountOnVendorType({
    serviceOptionIds,
    vendorTypeId,
  });

  if (serviceOptionIds.length !== validCount) {
    throw new BadRequestException(
      'Some of the selected service options are not valid for this vendor type',
    );
  }
}

async function validateKeywordsForServiceVendor({
  keyWordIds,
  vendorType,
  keywordService,
}: {
  keyWordIds?: string[];
  vendorType: VendorType;
  keywordService: KeywordService;
}) {
  if (!keyWordIds || keyWordIds.length === 0) {
    throw new BadRequestException(
      `Keywords are required for ${vendorType.name}`,
    );
  }

  const validKeywordCount =
    await keywordService.checkKeyWordCountForRegistration(
      keyWordIds,
      vendorType.id,
      KeyWordType.VENDOR_TYPE,
    );

  if (keyWordIds.length !== validKeywordCount) {
    throw new BadRequestException(
      'Apologies, some of the keywords are not valid',
    );
  }
}
