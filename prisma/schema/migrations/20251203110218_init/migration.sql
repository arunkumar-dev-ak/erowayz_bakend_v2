-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('CUSTOMER', 'VENDOR');

-- CreateEnum
CREATE TYPE "public"."DisclaimerType" AS ENUM ('PRODUCT_ORDER', 'SERVICE_BOOK', 'BANNER_BOOK', 'COINS', 'UPI', 'BLOOD', 'UPI_SETTLEMENT');

-- CreateEnum
CREATE TYPE "public"."PrivacyPolicyType" AS ENUM ('COINS', 'UPI', 'BLOOD');

-- CreateEnum
CREATE TYPE "public"."TermsAndConditionType" AS ENUM ('COINS', 'UPI', 'BLOOD');

-- CreateEnum
CREATE TYPE "public"."fgBannerImagePosition" AS ENUM ('LEFT', 'RIGHT');

-- CreateEnum
CREATE TYPE "public"."BannerType" AS ENUM ('PRODUCT', 'REGULAR');

-- CreateEnum
CREATE TYPE "public"."BannerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."OfferType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."BookingPaymentMethod" AS ENUM ('CASH', 'JUSPAY');

-- CreateEnum
CREATE TYPE "public"."DynamicContext" AS ENUM ('BLOOD_DETAIL', 'BLOOD_REQUEST');

-- CreateEnum
CREATE TYPE "public"."FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "public"."KeyWordType" AS ENUM ('BANNER', 'VENDOR_TYPE');

-- CreateEnum
CREATE TYPE "public"."OrderPaymentType" AS ENUM ('COINS', 'JUSPAY', 'CASH');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PENDING', 'DELIVERED');

-- CreateEnum
CREATE TYPE "public"."OrderPaymentStatus" AS ENUM ('NOT_STARTED', 'INITIATED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'JUSPAY', 'COINS');

-- CreateEnum
CREATE TYPE "public"."DeclineByType" AS ENUM ('VENDOR', 'CUSTOMER', 'SYSTEM', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."BillingPeriod" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."ErrorLogStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('CHARGED', 'PENDING', 'PROCESSING', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentPurpose" AS ENUM ('SUBSCRIPTION_PURCHASE', 'PRODUCT_PURCHASE', 'COIN_PURCHASE');

-- CreateEnum
CREATE TYPE "public"."RefundStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."QuantityUnit" AS ENUM ('GENERAL', 'KG', 'GRAM', 'BOX', 'SET', 'PIECE', 'LITRE', 'MILLILITRE', 'UNIT', 'SERVE');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "public"."UserReportStatusType" AS ENUM ('PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."SettlementStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "public"."OTPStatus" AS ENUM ('PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'ADMIN', 'VENDOR', 'STAFF', 'SUB_ADMIN');

-- CreateEnum
CREATE TYPE "public"."BloodGroups" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "public"."ShopType" AS ENUM ('CART', 'SHOP');

-- CreateEnum
CREATE TYPE "public"."LicenseType" AS ENUM ('FISSAI', 'UDYAM', 'AADHAR', 'DRIVING_LICENSE');

-- CreateEnum
CREATE TYPE "public"."VendorCategoryType" AS ENUM ('SERVICE', 'PRODUCT', 'BANNER');

-- CreateEnum
CREATE TYPE "public"."FormFieldType" AS ENUM ('TEXT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'NUMBER', 'DROPDOWN');

-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('SAVINGS', 'CURRENT');

-- CreateEnum
CREATE TYPE "public"."BankPlatformType" AS ENUM ('AMAZON_PAY', 'GOOGLE_PAY', 'PHONE_PAY', 'PAYTM');

-- CreateEnum
CREATE TYPE "public"."WalletTransactionType" AS ENUM ('ADMIN_TO_VENDOR', 'VENDOR_TO_CUSTOMER', 'CUSTOMER_TO_VENDOR_ORDER', 'VENDOR_TO_ADMIN_REFUND');

-- CreateTable
CREATE TABLE "public"."LicenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "vendorTypeId" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankPaymentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankPaymentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopCity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Disclaimer" (
    "id" TEXT NOT NULL,
    "disclaimerType" "public"."DisclaimerType" NOT NULL,
    "disclaimerHtml" TEXT NOT NULL,
    "disclaimerHtmlTa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disclaimer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TermsAndCondition" (
    "id" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "type" "public"."TermsAndConditionType",
    "vendorTypeId" TEXT,
    "termsAndConditionHtml" TEXT NOT NULL,
    "termsAndConditionHtmlTa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsAndCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrivacyPolicy" (
    "id" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "type" "public"."PrivacyPolicyType",
    "vendorTypeId" TEXT,
    "privacyPolicyHtml" TEXT NOT NULL,
    "privacyPolicyHtmlTa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoLink" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "tamilHeading" TEXT,
    "vendorTypeId" TEXT,
    "link" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Poster" (
    "id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "vendorTypeId" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoinImage" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformFees" (
    "id" TEXT NOT NULL,
    "startAmount" INTEGER NOT NULL,
    "endAmount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreDefinedBanner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "subHeading" TEXT,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "bgImageRef" TEXT,
    "bgImageRelativeUrl" TEXT,
    "bgColor" TEXT NOT NULL,
    "fgImageRef" TEXT,
    "fgImageRelativeUrl" TEXT,
    "textColor" TEXT NOT NULL,
    "offerType" "public"."OfferType" NOT NULL,
    "offerValue" INTEGER NOT NULL,
    "minApplyValue" INTEGER NOT NULL,
    "status" "public"."BannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreDefinedBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "bannerType" "public"."BannerType" NOT NULL DEFAULT 'REGULAR',
    "title" TEXT,
    "titleTamil" TEXT,
    "subTitle" TEXT,
    "subTitleTamil" TEXT,
    "subHeading" TEXT,
    "subHeadingTamil" TEXT,
    "description" TEXT,
    "descriptionTamil" TEXT,
    "vendorId" TEXT NOT NULL,
    "textColor" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "bgColor" TEXT,
    "bgImageRef" TEXT,
    "bgImageRelativeUrl" TEXT,
    "fgImageRef" TEXT,
    "fgImageRelativeUrl" TEXT,
    "fgImagePosition" "public"."fgBannerImagePosition",
    "minApplyValue" INTEGER NOT NULL,
    "offerType" "public"."OfferType" NOT NULL,
    "offerValue" INTEGER NOT NULL,
    "status" "public"."BannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "originalPricePerUnit" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "qtyUnit" "public"."QuantityUnit",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KeywordBanner" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BannerItemImages" (
    "id" TEXT NOT NULL,
    "imageRef" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bannerId" TEXT NOT NULL,

    CONSTRAINT "BannerItemImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BannerVendorItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "vendorId" TEXT NOT NULL,
    "quantityUnit" "public"."QuantityUnit" NOT NULL DEFAULT 'GENERAL',
    "quantity" INTEGER NOT NULL,
    "productstatus" "public"."ProductStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerVendorItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BannerVendorItemsImage" (
    "id" TEXT NOT NULL,
    "bannerVendorItemId" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerVendorItemsImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "bookedId" TEXT NOT NULL,
    "preferredPaymentMethod" "public"."BookingPaymentMethod" NOT NULL DEFAULT 'CASH',
    "userId" TEXT NOT NULL,
    "bookingStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "declineType" "public"."DeclineByType",
    "declinedBy" TEXT,
    "declinedReason" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "vendorSubServiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BannerBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "bannerName" TEXT NOT NULL,
    "offerType" "public"."OfferType" NOT NULL,
    "offerValue" DOUBLE PRECISION NOT NULL,
    "minApplyValue" DOUBLE PRECISION NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bgImageRef" TEXT,
    "fgImageRef" TEXT,

    CONSTRAINT "BannerBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItemVendorServiceOption" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItemVendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DynamicField" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "public"."FieldType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "pattern" TEXT,
    "errorMessage" TEXT,
    "context" "public"."DynamicContext" NOT NULL,
    "status" "public"."Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DynamicSelectOption" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "DynamicSelectOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FavouriteCustomerForVendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteCustomerForVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FavouriteVendorForCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteVendorForCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keyWord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "vendorTypeId" TEXT NOT NULL,
    "keyWordType" "public"."KeyWordType" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceVendorKeyword" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVendorKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "preferredPaymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'CASH',
    "userId" TEXT NOT NULL,
    "declineType" "public"."DeclineByType",
    "declinedBy" TEXT,
    "bannerId" TEXT,
    "bannerOfferType" "public"."OfferType",
    "bannerOfferValue" DOUBLE PRECISION,
    "bannerTitle" TEXT,
    "expiryAt" TIMESTAMP(3) NOT NULL,
    "finalPayableAmount" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderStatus" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "platformFee" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "walletTransactionId" TEXT,
    "type" "public"."OrderPaymentType" NOT NULL,
    "paidedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."OrderPaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityUnit" "public"."QuantityUnit",
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItemVendorServiceOption" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItemVendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingPeriod" "public"."BillingPeriod" NOT NULL,
    "discountPrice" INTEGER,
    "vendorTypeId" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "gradientStart" TEXT,
    "gradientEnd" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "juspayOrderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "purpose" "public"."PaymentPurpose" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "paymentPageExpiry" TIMESTAMP(3) NOT NULL,
    "paymentLinkWeb" TEXT NOT NULL,
    "juspayTxnId" TEXT,
    "gatewayTxnUuid" TEXT,
    "gatewayId" INTEGER,
    "gateway" TEXT,
    "status_id" TEXT,
    "auth_type" TEXT,
    "paymentMethod" TEXT,
    "cardLast4" TEXT,
    "cardType" TEXT,
    "cardBrand" TEXT,
    "cardIssuerCountry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Refund" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "uniqueRequestId" TEXT NOT NULL,
    "initiatedBy" TEXT,
    "refundType" TEXT,
    "refundSource" TEXT,
    "sentToGateway" BOOLEAN,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ManualRefund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "public"."RefundStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "attachment" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentErrorLog" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "vendorUserId" TEXT NOT NULL,
    "purpose" "public"."PaymentPurpose",
    "status" "public"."ErrorLogStatus" NOT NULL DEFAULT 'PENDING',
    "customerUserId" TEXT,
    "errorType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentErrorLogFile" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "paymentErrorLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentErrorLogFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "imageRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "imageRef" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "description" TEXT NOT NULL,
    "descriptionTamil" TEXT,
    "startAvailableTime" TEXT,
    "endAvailableTime" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "minSellingQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "quantityUnit" "public"."QuantityUnit" DEFAULT 'GENERAL',
    "productUnitId" TEXT,
    "dailyTotalQty" DOUBLE PRECISION NOT NULL,
    "remainingQty" DOUBLE PRECISION NOT NULL,
    "productstatus" "public"."ProductStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "totalQtyEditCount" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemImage" (
    "id" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserReport" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "bookingId" TEXT,
    "userId" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "status" "public"."UserReportStatusType" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER,
    "review" TEXT,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT,
    "orderItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorServiceOption" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "serviceOptionId" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "VendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "description" TEXT,
    "serviceOptionId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorSubService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceImage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderSettlement" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."SettlementStatus" NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderSettlementFile" (
    "id" TEXT NOT NULL,
    "proofImage" TEXT NOT NULL,
    "orderSettlementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSettlementFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "imageRef" TEXT,
    "relativeUrl" TEXT,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "mobile" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "salt" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "referralCode" TEXT,
    "referrerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OTP" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fcmToken" TEXT,
    "role" "public"."Role" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."OTPStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TempRegister" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "fcmToken" TEXT,
    "status" "public"."OTPStatus" NOT NULL DEFAULT 'PENDING',
    "licenseRelPath" TEXT,
    "licenseAbsPath" TEXT,
    "profileRelPath" TEXT,
    "profileAbsPath" TEXT,
    "shopRelPath" TEXT,
    "shopAbsPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FCMToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" VARCHAR(2048) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BloodDetails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bloodGroup" "public"."BloodGroups" NOT NULL,
    "isDonor" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BloodRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "patientMobileNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dynamicFieldData" JSONB,

    CONSTRAINT "BloodRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorSubscription" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "paymentId" TEXT,
    "planId" TEXT,
    "planName" TEXT NOT NULL,
    "planFeatures" JSONB NOT NULL,
    "planBillingPeriod" "public"."BillingPeriod" NOT NULL,
    "planPrice" INTEGER NOT NULL,
    "planDiscountPrice" INTEGER,
    "referredVendorId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorFeatureUsage" (
    "id" TEXT NOT NULL,
    "itemId" TEXT,
    "shopId" TEXT,
    "feature" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "vendorSubscriptionId" TEXT NOT NULL,

    CONSTRAINT "VendorFeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "paymentMethod" "public"."PaymentMethod"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorReferral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "imageRef" TEXT,
    "shopDynamicFields" JSONB,
    "type" "public"."VendorCategoryType" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "relativeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "vendorTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "relativeUrl" TEXT,
    "serviceOptImageRef" TEXT,

    CONSTRAINT "ServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Staff" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopInfo" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "address" TEXT NOT NULL,
    "addressTamil" TEXT,
    "city" TEXT,
    "shopCityId" TEXT,
    "pincode" TEXT NOT NULL,
    "shopImageRef" TEXT,
    "relativeUrl" TEXT,
    "shopType" "public"."ShopType",
    "shopCategoryId" TEXT,
    "istermsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "dynamicValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isShopOpen" BOOLEAN NOT NULL DEFAULT false,
    "location" geography(Point,4326),

    CONSTRAINT "ShopInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopWorkingHour" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "area" TEXT,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "openTime" TIMESTAMP(3),
    "closeTime" TIMESTAMP(3),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShopWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."License" (
    "id" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "relativeUrl" TEXT,
    "image" TEXT,
    "licenseType" "public"."LicenseType",
    "licenseCategoryId" TEXT,
    "shopInfoId" TEXT NOT NULL,
    "isLicenseApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BankDetail" (
    "id" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT,
    "bankNameId" TEXT,
    "branchName" TEXT NOT NULL,
    "accountType" "public"."AccountType" NOT NULL,
    "bankPlatformType" "public"."BankPlatformType",
    "bankPaymentTypeId" TEXT,
    "linkedPhoneNumber" TEXT,
    "upiId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletTransaction" (
    "id" TEXT NOT NULL,
    "senderWalletId" TEXT,
    "receiverWalletId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionType" "public"."WalletTransactionType" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminVendorCredit" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "totalGiven" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRefunded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminVendorCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoinsSettlement" (
    "id" TEXT NOT NULL,
    "walletTransactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinsSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CoinsSettlementFile" (
    "id" TEXT NOT NULL,
    "proofImage" TEXT NOT NULL,
    "coinsSettlementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinsSettlementFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCategory_name_key" ON "public"."LicenseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductUnit_name_key" ON "public"."ProductUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopCategory_name_vendorTypeId_key" ON "public"."ShopCategory"("name", "vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BankName_name_key" ON "public"."BankName"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BankPaymentType_name_key" ON "public"."BankPaymentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopCity_name_key" ON "public"."ShopCity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyPolicy_vendorTypeId_key" ON "public"."PrivacyPolicy"("vendorTypeId");

-- CreateIndex
CREATE INDEX "PlatformFees_startAmount_idx" ON "public"."PlatformFees"("startAmount");

-- CreateIndex
CREATE INDEX "PlatformFees_endAmount_idx" ON "public"."PlatformFees"("endAmount");

-- CreateIndex
CREATE UNIQUE INDEX "PreDefinedBanner_name_key" ON "public"."PreDefinedBanner"("name");

-- CreateIndex
CREATE INDEX "PreDefinedBanner_id_name_idx" ON "public"."PreDefinedBanner"("id", "name");

-- CreateIndex
CREATE INDEX "Banner_id_vendorId_idx" ON "public"."Banner"("id", "vendorId");

-- CreateIndex
CREATE INDEX "Banner_id_name_vendorId_idx" ON "public"."Banner"("id", "name", "vendorId");

-- CreateIndex
CREATE INDEX "Banner_name_idx" ON "public"."Banner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_name_vendorId_key" ON "public"."Banner"("name", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordBanner_bannerId_keywordId_key" ON "public"."KeywordBanner"("bannerId", "keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "BannerVendorItem_vendorId_name_key" ON "public"."BannerVendorItem"("vendorId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookedId_key" ON "public"."Booking"("bookedId");

-- CreateIndex
CREATE INDEX "Booking_id_userId_idx" ON "public"."Booking"("id", "userId");

-- CreateIndex
CREATE INDEX "ServiceBooking_bookingId_idx" ON "public"."ServiceBooking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBooking_bookingId_vendorSubServiceId_key" ON "public"."ServiceBooking"("bookingId", "vendorSubServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "BannerBooking_bookingId_key" ON "public"."BannerBooking"("bookingId");

-- CreateIndex
CREATE INDEX "BannerBooking_vendorId_idx" ON "public"."BannerBooking"("vendorId");

-- CreateIndex
CREATE INDEX "Cart_id_userId_idx" ON "public"."Cart"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_vendorId_key" ON "public"."Cart"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_itemId_key" ON "public"."CartItem"("cartId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItemVendorServiceOption_cartItemId_vendorServiceOptionI_key" ON "public"."CartItemVendorServiceOption"("cartItemId", "vendorServiceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicField_label_context_key" ON "public"."DynamicField"("label", "context");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteCustomerForVendor_userId_vendorId_key" ON "public"."FavouriteCustomerForVendor"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteVendorForCustomer_userId_vendorId_key" ON "public"."FavouriteVendorForCustomer"("userId", "vendorId");

-- CreateIndex
CREATE INDEX "keyWord_vendorTypeId_name_keyWordType_idx" ON "public"."keyWord"("vendorTypeId", "name", "keyWordType");

-- CreateIndex
CREATE INDEX "keyWord_id_vendorTypeId_idx" ON "public"."keyWord"("id", "vendorTypeId");

-- CreateIndex
CREATE INDEX "keyWord_name_idx" ON "public"."keyWord"("name");

-- CreateIndex
CREATE UNIQUE INDEX "keyWord_vendorTypeId_name_key" ON "public"."keyWord"("vendorTypeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceVendorKeyword_keywordId_vendorId_key" ON "public"."ServiceVendorKeyword"("keywordId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "public"."Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_orderId_key" ON "public"."OrderPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_paymentId_key" ON "public"."OrderPayment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_walletTransactionId_key" ON "public"."OrderPayment"("walletTransactionId");

-- CreateIndex
CREATE INDEX "OrderPayment_orderId_idx" ON "public"."OrderPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_itemId_orderId_key" ON "public"."OrderItem"("itemId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemVendorServiceOption_cartItemId_vendorServiceOption_key" ON "public"."OrderItemVendorServiceOption"("cartItemId", "vendorServiceOptionId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_vendorTypeId_idx" ON "public"."SubscriptionPlan"("vendorTypeId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_billingPeriod_idx" ON "public"."SubscriptionPlan"("billingPeriod");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_status_idx" ON "public"."SubscriptionPlan"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_name_idx" ON "public"."SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_vendorTypeId_billingPeriod_key" ON "public"."SubscriptionPlan"("name", "vendorTypeId", "billingPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_juspayOrderId_key" ON "public"."Payment"("juspayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "public"."Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_purpose_referenceId_idx" ON "public"."Payment"("purpose", "referenceId");

-- CreateIndex
CREATE INDEX "Payment_paymentPageExpiry_idx" ON "public"."Payment"("paymentPageExpiry");

-- CreateIndex
CREATE INDEX "Payment_purpose_userId_status_idx" ON "public"."Payment"("purpose", "userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_uniqueRequestId_key" ON "public"."Refund"("uniqueRequestId");

-- CreateIndex
CREATE INDEX "ManualRefund_paymentId_idx" ON "public"."ManualRefund"("paymentId");

-- CreateIndex
CREATE INDEX "Category_name_vendorTypeId_id_idx" ON "public"."Category"("name", "vendorTypeId", "id");

-- CreateIndex
CREATE INDEX "Category_name_vendorTypeId_idx" ON "public"."Category"("name", "vendorTypeId");

-- CreateIndex
CREATE INDEX "Category_id_vendorTypeId_idx" ON "public"."Category"("id", "vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_vendorTypeId_key" ON "public"."Category"("name", "vendorTypeId");

-- CreateIndex
CREATE INDEX "SubCategory_name_categoryId_id_idx" ON "public"."SubCategory"("name", "categoryId", "id");

-- CreateIndex
CREATE INDEX "SubCategory_id_categoryId_idx" ON "public"."SubCategory"("id", "categoryId");

-- CreateIndex
CREATE INDEX "SubCategory_categoryId_idx" ON "public"."SubCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_name_categoryId_key" ON "public"."SubCategory"("name", "categoryId");

-- CreateIndex
CREATE INDEX "Item_vendorId_idx" ON "public"."Item"("vendorId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "public"."Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_subCategoryId_idx" ON "public"."Item"("subCategoryId");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "public"."Item"("name");

-- CreateIndex
CREATE INDEX "Item_vendorId_categoryId_subCategoryId_idx" ON "public"."Item"("vendorId", "categoryId", "subCategoryId");

-- CreateIndex
CREATE INDEX "Item_categoryId_subCategoryId_name_idx" ON "public"."Item"("categoryId", "subCategoryId", "name");

-- CreateIndex
CREATE INDEX "Item_vendorId_name_idx" ON "public"."Item"("vendorId", "name");

-- CreateIndex
CREATE INDEX "Item_id_vendorId_idx" ON "public"."Item"("id", "vendorId");

-- CreateIndex
CREATE INDEX "Item_vendorId_categoryId_idx" ON "public"."Item"("vendorId", "categoryId");

-- CreateIndex
CREATE INDEX "Item_vendorId_status_idx" ON "public"."Item"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Item_productstatus_idx" ON "public"."Item"("productstatus");

-- CreateIndex
CREATE INDEX "Item_remainingQty_idx" ON "public"."Item"("remainingQty");

-- CreateIndex
CREATE INDEX "Item_dailyTotalQty_idx" ON "public"."Item"("dailyTotalQty");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_vendorId_key" ON "public"."Item"("name", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemImage_relativeUrl_key" ON "public"."ItemImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ItemImage_absoluteUrl_key" ON "public"."ItemImage"("absoluteUrl");

-- CreateIndex
CREATE INDEX "ItemImage_itemId_idx" ON "public"."ItemImage"("itemId");

-- CreateIndex
CREATE INDEX "UserReport_userId_idx" ON "public"."UserReport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemId_key" ON "public"."Review"("orderItemId");

-- CreateIndex
CREATE INDEX "Review_vendorId_idx" ON "public"."Review"("vendorId");

-- CreateIndex
CREATE INDEX "Review_orderItemId_idx" ON "public"."Review"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_vendorId_key" ON "public"."Review"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_orderItemId_key" ON "public"."Review"("userId", "orderItemId");

-- CreateIndex
CREATE INDEX "VendorServiceOption_vendorId_idx" ON "public"."VendorServiceOption"("vendorId");

-- CreateIndex
CREATE INDEX "VendorServiceOption_serviceOptionId_idx" ON "public"."VendorServiceOption"("serviceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorServiceOption_vendorId_serviceOptionId_key" ON "public"."VendorServiceOption"("vendorId", "serviceOptionId");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "public"."Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_vendorId_serviceOptionId_key" ON "public"."Service"("name", "vendorId", "serviceOptionId");

-- CreateIndex
CREATE INDEX "VendorSubService_serviceId_idx" ON "public"."VendorSubService"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubService_name_serviceId_key" ON "public"."VendorSubService"("name", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceImage_relativeUrl_key" ON "public"."ServiceImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceImage_absoluteUrl_key" ON "public"."ServiceImage"("absoluteUrl");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSettlement_vendorId_date_key" ON "public"."OrderSettlement"("vendorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "public"."User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "public"."User"("referralCode");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "public"."User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TempRegister_cacheKey_key" ON "public"."TempRegister"("cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "public"."FCMToken"("token");

-- CreateIndex
CREATE INDEX "FCMToken_userId_idx" ON "public"."FCMToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_id_idx" ON "public"."RefreshToken"("id");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_createdAt_idx" ON "public"."RefreshToken"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BloodDetails_userId_key" ON "public"."BloodDetails"("userId");

-- CreateIndex
CREATE INDEX "BloodRequest_userId_donorId_idx" ON "public"."BloodRequest"("userId", "donorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubscription_paymentId_key" ON "public"."VendorSubscription"("paymentId");

-- CreateIndex
CREATE INDEX "VendorFeatureUsage_itemId_idx" ON "public"."VendorFeatureUsage"("itemId");

-- CreateIndex
CREATE INDEX "VendorFeatureUsage_shopId_idx" ON "public"."VendorFeatureUsage"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorFeatureUsage_feature_vendorSubscriptionId_itemId_key" ON "public"."VendorFeatureUsage"("feature", "vendorSubscriptionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "public"."Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorType_name_key" ON "public"."VendorType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "public"."Staff"("userId");

-- CreateIndex
CREATE INDEX "Staff_id_vendorId_idx" ON "public"."Staff"("id", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_vendorId_key" ON "public"."Staff"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopInfo_vendorId_key" ON "public"."ShopInfo"("vendorId");

-- CreateIndex
CREATE INDEX "shopinfo_location_idx" ON "public"."ShopInfo" USING GIST ("location");

-- CreateIndex
CREATE INDEX "ShopInfo_name_idx" ON "public"."ShopInfo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopWorkingHour_shopId_dayOfWeek_key" ON "public"."ShopWorkingHour"("shopId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseNo_key" ON "public"."License"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "License_shopInfoId_key" ON "public"."License"("shopInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_vendorId_key" ON "public"."BankDetail"("vendorId");

-- CreateIndex
CREATE INDEX "BankDetail_upiId_idx" ON "public"."BankDetail"("upiId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "public"."Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_paymentId_key" ON "public"."WalletTransaction"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminVendorCredit_vendorId_key" ON "public"."AdminVendorCredit"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "CoinsSettlement_walletTransactionId_key" ON "public"."CoinsSettlement"("walletTransactionId");

-- AddForeignKey
ALTER TABLE "public"."ShopCategory" ADD CONSTRAINT "ShopCategory_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TermsAndCondition" ADD CONSTRAINT "TermsAndCondition_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrivacyPolicy" ADD CONSTRAINT "PrivacyPolicy_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoLink" ADD CONSTRAINT "VideoLink_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Poster" ADD CONSTRAINT "Poster_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreDefinedBanner" ADD CONSTRAINT "PreDefinedBanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Banner" ADD CONSTRAINT "Banner_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KeywordBanner" ADD CONSTRAINT "KeywordBanner_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "public"."Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KeywordBanner" ADD CONSTRAINT "KeywordBanner_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "public"."keyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerItemImages" ADD CONSTRAINT "BannerItemImages_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "public"."Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerVendorItem" ADD CONSTRAINT "BannerVendorItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerVendorItemsImage" ADD CONSTRAINT "BannerVendorItemsImage_bannerVendorItemId_fkey" FOREIGN KEY ("bannerVendorItemId") REFERENCES "public"."BannerVendorItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_declinedBy_fkey" FOREIGN KEY ("declinedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceBooking" ADD CONSTRAINT "ServiceBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceBooking" ADD CONSTRAINT "ServiceBooking_vendorSubServiceId_fkey" FOREIGN KEY ("vendorSubServiceId") REFERENCES "public"."VendorSubService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerBooking" ADD CONSTRAINT "BannerBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BannerBooking" ADD CONSTRAINT "BannerBooking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "public"."VendorServiceOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "public"."CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DynamicSelectOption" ADD CONSTRAINT "DynamicSelectOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."DynamicField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavouriteCustomerForVendor" ADD CONSTRAINT "FavouriteCustomerForVendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavouriteCustomerForVendor" ADD CONSTRAINT "FavouriteCustomerForVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavouriteVendorForCustomer" ADD CONSTRAINT "FavouriteVendorForCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavouriteVendorForCustomer" ADD CONSTRAINT "FavouriteVendorForCustomer_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keyWord" ADD CONSTRAINT "keyWord_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceVendorKeyword" ADD CONSTRAINT "ServiceVendorKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "public"."keyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceVendorKeyword" ADD CONSTRAINT "ServiceVendorKeyword_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_declinedBy_fkey" FOREIGN KEY ("declinedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderPayment" ADD CONSTRAINT "OrderPayment_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "public"."WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemVendorServiceOption" ADD CONSTRAINT "OrderItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "public"."VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItemVendorServiceOption" ADD CONSTRAINT "OrderItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "public"."OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManualRefund" ADD CONSTRAINT "ManualRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ManualRefund" ADD CONSTRAINT "ManualRefund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentErrorLog" ADD CONSTRAINT "PaymentErrorLog_vendorUserId_fkey" FOREIGN KEY ("vendorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentErrorLog" ADD CONSTRAINT "PaymentErrorLog_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentErrorLogFile" ADD CONSTRAINT "PaymentErrorLogFile_paymentErrorLogId_fkey" FOREIGN KEY ("paymentErrorLogId") REFERENCES "public"."PaymentErrorLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "public"."SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Item" ADD CONSTRAINT "Item_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "public"."ProductUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemImage" ADD CONSTRAINT "ItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserReport" ADD CONSTRAINT "UserReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorServiceOption" ADD CONSTRAINT "VendorServiceOption_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "public"."ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorServiceOption" ADD CONSTRAINT "VendorServiceOption_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "public"."ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorSubService" ADD CONSTRAINT "VendorSubService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceImage" ADD CONSTRAINT "ServiceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderSettlement" ADD CONSTRAINT "OrderSettlement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderSettlementFile" ADD CONSTRAINT "OrderSettlementFile_orderSettlementId_fkey" FOREIGN KEY ("orderSettlementId") REFERENCES "public"."OrderSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FCMToken" ADD CONSTRAINT "FCMToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodDetails" ADD CONSTRAINT "BloodDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodRequest" ADD CONSTRAINT "BloodRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodRequest" ADD CONSTRAINT "BloodRequest_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorSubscription" ADD CONSTRAINT "VendorSubscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorSubscription" ADD CONSTRAINT "VendorSubscription_referredVendorId_fkey" FOREIGN KEY ("referredVendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorSubscription" ADD CONSTRAINT "VendorSubscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorSubscription" ADD CONSTRAINT "VendorSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorFeatureUsage" ADD CONSTRAINT "VendorFeatureUsage_vendorSubscriptionId_fkey" FOREIGN KEY ("vendorSubscriptionId") REFERENCES "public"."VendorSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorFeatureUsage" ADD CONSTRAINT "VendorFeatureUsage_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."ShopInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorFeatureUsage" ADD CONSTRAINT "VendorFeatureUsage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vendor" ADD CONSTRAINT "Vendor_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorReferral" ADD CONSTRAINT "VendorReferral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorReferral" ADD CONSTRAINT "VendorReferral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorType" ADD CONSTRAINT "VendorType_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceOption" ADD CONSTRAINT "ServiceOption_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "public"."VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Staff" ADD CONSTRAINT "Staff_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopInfo" ADD CONSTRAINT "ShopInfo_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopInfo" ADD CONSTRAINT "ShopInfo_shopCategoryId_fkey" FOREIGN KEY ("shopCategoryId") REFERENCES "public"."ShopCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopInfo" ADD CONSTRAINT "ShopInfo_shopCityId_fkey" FOREIGN KEY ("shopCityId") REFERENCES "public"."ShopCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopWorkingHour" ADD CONSTRAINT "ShopWorkingHour_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."ShopInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."License" ADD CONSTRAINT "License_shopInfoId_fkey" FOREIGN KEY ("shopInfoId") REFERENCES "public"."ShopInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."License" ADD CONSTRAINT "License_licenseCategoryId_fkey" FOREIGN KEY ("licenseCategoryId") REFERENCES "public"."LicenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BankDetail" ADD CONSTRAINT "BankDetail_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BankDetail" ADD CONSTRAINT "BankDetail_bankNameId_fkey" FOREIGN KEY ("bankNameId") REFERENCES "public"."BankName"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BankDetail" ADD CONSTRAINT "BankDetail_bankPaymentTypeId_fkey" FOREIGN KEY ("bankPaymentTypeId") REFERENCES "public"."BankPaymentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_senderWalletId_fkey" FOREIGN KEY ("senderWalletId") REFERENCES "public"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_receiverWalletId_fkey" FOREIGN KEY ("receiverWalletId") REFERENCES "public"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminVendorCredit" ADD CONSTRAINT "AdminVendorCredit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoinsSettlement" ADD CONSTRAINT "CoinsSettlement_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "public"."WalletTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoinsSettlementFile" ADD CONSTRAINT "CoinsSettlementFile_coinsSettlementId_fkey" FOREIGN KEY ("coinsSettlementId") REFERENCES "public"."CoinsSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
