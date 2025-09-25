-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'VENDOR');

-- CreateEnum
CREATE TYPE "fgBannerImagePosition" AS ENUM ('LEFT', 'RIGHT');

-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('PRODUCT', 'REGULAR');

-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "DynamicContext" AS ENUM ('BLOOD_DETAIL', 'BLOOD_REQUEST');

-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SINGLE_SELECT', 'MULTI_SELECT', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "KeyWordType" AS ENUM ('BANNER', 'VENDOR_TYPE');

-- CreateEnum
CREATE TYPE "OrderPaymentType" AS ENUM ('COINS', 'JUSPAY', 'CASH');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PENDING', 'DELIVERED');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('NOT_STARTED', 'INITIATED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'JUSPAY', 'COINS');

-- CreateEnum
CREATE TYPE "DeclineByType" AS ENUM ('VENDOR', 'CUSTOMER', 'SYSTEM', 'STAFF');

-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('GENERAL', 'KG', 'GRAM', 'BOX', 'SET', 'PIECE', 'LITRE', 'MILLILITRE', 'UNIT', 'SERVE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CHARGED', 'PENDING', 'PROCESSING', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('SUBSCRIPTION_PURCHASE', 'PRODUCT_PURCHASE', 'COIN_PURCHASE');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OTPStatus" AS ENUM ('PENDING', 'VERIFIED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'VENDOR', 'STAFF');

-- CreateEnum
CREATE TYPE "BloodGroups" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('CART', 'SHOP');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('FISSAI', 'UDYAM', 'AADHAR', 'DRIVING_LICENSE');

-- CreateEnum
CREATE TYPE "VendorCategoryType" AS ENUM ('SERVICE', 'PRODUCT', 'BANNER');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'NUMBER', 'DROPDOWN');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CURRENT');

-- CreateEnum
CREATE TYPE "BankPlatformType" AS ENUM ('AMAZON_PAY', 'GOOGLE_PAY', 'PHONE_PAY', 'PAYTM');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('ADMIN_TO_VENDOR', 'VENDOR_TO_CUSTOMER', 'CUSTOMER_TO_VENDOR_ORDER', 'VENDOR_TO_ADMIN_REFUND');

-- CreateTable
CREATE TABLE "LicenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankName" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankPaymentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankPaymentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopCity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tamilName" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Disclaimer" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disclaimer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsAndCondition" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TermsAndCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyPolicy" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrivacyPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoLink" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poster" (
    "id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreDefinedBanner" (
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
    "offerType" "OfferType" NOT NULL,
    "offerValue" INTEGER NOT NULL,
    "minApplyValue" INTEGER NOT NULL,
    "status" "BannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreDefinedBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bannerType" "BannerType" NOT NULL DEFAULT 'REGULAR',
    "title" TEXT,
    "subTitle" TEXT,
    "subHeading" TEXT,
    "description" TEXT,
    "vendorId" TEXT NOT NULL,
    "textColor" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "bgColor" TEXT,
    "bgImageRef" TEXT,
    "bgImageRelativeUrl" TEXT,
    "fgImageRef" TEXT,
    "fgImageRelativeUrl" TEXT,
    "fgImagePosition" "fgBannerImagePosition",
    "minApplyValue" INTEGER NOT NULL,
    "offerType" "OfferType" NOT NULL,
    "offerValue" INTEGER NOT NULL,
    "status" "BannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "originalPricePerUnit" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "qtyUnit" "QuantityUnit",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordBanner" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerItemImages" (
    "id" TEXT NOT NULL,
    "imageRef" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bannerId" TEXT NOT NULL,

    CONSTRAINT "BannerItemImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerVendorItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "vendorId" TEXT NOT NULL,
    "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'GENERAL',
    "quantity" INTEGER NOT NULL,
    "productstatus" "ProductStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerVendorItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerVendorItemsImage" (
    "id" TEXT NOT NULL,
    "bannerVendorItemId" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerVendorItemsImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookedId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "declineType" "DeclineByType",
    "declinedBy" TEXT,
    "declinedReason" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBooking" (
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
CREATE TABLE "BannerBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "bannerName" TEXT NOT NULL,
    "offerType" "OfferType" NOT NULL,
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
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItemVendorServiceOption" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItemVendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicField" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "pattern" TEXT,
    "errorMessage" TEXT,
    "context" "DynamicContext" NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicSelectOption" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "DynamicSelectOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteCustomerForVendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteCustomerForVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavouriteVendorForCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavouriteVendorForCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyWord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "keyWordType" "KeyWordType" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVendorKeyword" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceVendorKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "preferredPaymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "userId" TEXT NOT NULL,
    "declineType" "DeclineByType",
    "declinedBy" TEXT,
    "bannerId" TEXT,
    "bannerOfferType" "OfferType",
    "bannerOfferValue" DOUBLE PRECISION,
    "bannerTitle" TEXT,
    "expiryAt" TIMESTAMP(3) NOT NULL,
    "finalPayableAmount" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "walletTransactionId" TEXT,
    "type" "OrderPaymentType" NOT NULL,
    "paidedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "OrderPaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityUnit" "QuantityUnit",
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemVendorServiceOption" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItemVendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageRef" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "description" TEXT NOT NULL,
    "descriptionTamil" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "minSellingQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "quantityUnit" "QuantityUnit" DEFAULT 'GENERAL',
    "productUnitId" TEXT,
    "dailyTotalQty" DOUBLE PRECISION NOT NULL,
    "remainingQty" DOUBLE PRECISION NOT NULL,
    "productstatus" "ProductStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "totalQtyEditCount" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemImage" (
    "id" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
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
CREATE TABLE "VendorServiceOption" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "serviceOptionId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "VendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceOptionId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSubService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceImage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "relativeUrl" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderSettlement" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'UNPAID',
    "proofImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingPeriod" "BillingPeriod" NOT NULL,
    "discountPrice" INTEGER,
    "vendorTypeId" TEXT NOT NULL,
    "features" JSONB NOT NULL,
    "gradientStart" TEXT,
    "gradientEnd" TEXT,
    "status" "Status" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "juspayOrderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "Refund" (
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
CREATE TABLE "ManualRefund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "RefundStatus" NOT NULL,
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
CREATE TABLE "VendorSubscription" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "planId" TEXT,
    "planName" TEXT NOT NULL,
    "planFeatures" JSONB NOT NULL,
    "planBillingPeriod" "BillingPeriod" NOT NULL,
    "planPrice" INTEGER NOT NULL,
    "planDiscountPrice" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentErrorLog" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "vendorUserId" TEXT NOT NULL,
    "purpose" "PaymentPurpose",
    "customerUserId" TEXT,
    "errorType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metaData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "imageRef" TEXT,
    "relativeUrl" TEXT,
    "name" TEXT NOT NULL,
    "nameTamil" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "mobile" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "salt" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "referralCode" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fcmToken" TEXT,
    "role" "Role" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "OTPStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempRegister" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "sessionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "fcmToken" TEXT,
    "status" "OTPStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "FCMToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" VARCHAR(2048) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodDetails" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bloodGroup" "BloodGroups" NOT NULL,
    "isDonor" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodRequest" (
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
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorReferral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageRef" TEXT,
    "shopDynamicFields" JSONB,
    "type" "VendorCategoryType" NOT NULL,
    "creatorId" TEXT NOT NULL,
    "relativeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "relativeUrl" TEXT,
    "serviceOptImageRef" TEXT,

    CONSTRAINT "ServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopInfo" (
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
    "shopType" "ShopType",
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
CREATE TABLE "ShopWorkingHour" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "area" TEXT,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" TIMESTAMP(3),
    "closeTime" TIMESTAMP(3),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShopWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "relativeUrl" TEXT,
    "image" TEXT,
    "licenseType" "LicenseType",
    "licenseCategoryId" TEXT,
    "shopInfoId" TEXT NOT NULL,
    "isLicenseApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetail" (
    "id" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT,
    "bankNameId" TEXT,
    "branchName" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "bankPlatformType" "BankPlatformType",
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
CREATE TABLE "Wallet" (
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
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "senderWalletId" TEXT,
    "receiverWalletId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionType" "WalletTransactionType" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminVendorCredit" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "totalGiven" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRefunded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminVendorCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCategory_name_key" ON "LicenseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductUnit_name_key" ON "ProductUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopCategory_name_vendorTypeId_key" ON "ShopCategory"("name", "vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BankName_name_key" ON "BankName"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BankPaymentType_name_key" ON "BankPaymentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopCity_name_key" ON "ShopCity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PreDefinedBanner_name_key" ON "PreDefinedBanner"("name");

-- CreateIndex
CREATE INDEX "PreDefinedBanner_id_name_idx" ON "PreDefinedBanner"("id", "name");

-- CreateIndex
CREATE INDEX "Banner_id_vendorId_idx" ON "Banner"("id", "vendorId");

-- CreateIndex
CREATE INDEX "Banner_id_name_vendorId_idx" ON "Banner"("id", "name", "vendorId");

-- CreateIndex
CREATE INDEX "Banner_name_idx" ON "Banner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_name_vendorId_key" ON "Banner"("name", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordBanner_bannerId_keywordId_key" ON "KeywordBanner"("bannerId", "keywordId");

-- CreateIndex
CREATE UNIQUE INDEX "BannerVendorItem_vendorId_name_key" ON "BannerVendorItem"("vendorId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookedId_key" ON "Booking"("bookedId");

-- CreateIndex
CREATE INDEX "Booking_id_userId_idx" ON "Booking"("id", "userId");

-- CreateIndex
CREATE INDEX "ServiceBooking_bookingId_idx" ON "ServiceBooking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBooking_bookingId_vendorSubServiceId_key" ON "ServiceBooking"("bookingId", "vendorSubServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "BannerBooking_bookingId_key" ON "BannerBooking"("bookingId");

-- CreateIndex
CREATE INDEX "BannerBooking_vendorId_idx" ON "BannerBooking"("vendorId");

-- CreateIndex
CREATE INDEX "Cart_id_userId_idx" ON "Cart"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_vendorId_key" ON "Cart"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_itemId_key" ON "CartItem"("cartId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItemVendorServiceOption_cartItemId_vendorServiceOptionI_key" ON "CartItemVendorServiceOption"("cartItemId", "vendorServiceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicField_label_context_key" ON "DynamicField"("label", "context");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteCustomerForVendor_userId_vendorId_key" ON "FavouriteCustomerForVendor"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteVendorForCustomer_userId_vendorId_key" ON "FavouriteVendorForCustomer"("userId", "vendorId");

-- CreateIndex
CREATE INDEX "keyWord_vendorTypeId_name_keyWordType_idx" ON "keyWord"("vendorTypeId", "name", "keyWordType");

-- CreateIndex
CREATE INDEX "keyWord_id_vendorTypeId_idx" ON "keyWord"("id", "vendorTypeId");

-- CreateIndex
CREATE INDEX "keyWord_name_idx" ON "keyWord"("name");

-- CreateIndex
CREATE UNIQUE INDEX "keyWord_vendorTypeId_name_key" ON "keyWord"("vendorTypeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceVendorKeyword_keywordId_vendorId_key" ON "ServiceVendorKeyword"("keywordId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_orderId_key" ON "OrderPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_paymentId_key" ON "OrderPayment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderPayment_walletTransactionId_key" ON "OrderPayment"("walletTransactionId");

-- CreateIndex
CREATE INDEX "OrderPayment_orderId_idx" ON "OrderPayment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_itemId_orderId_key" ON "OrderItem"("itemId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemVendorServiceOption_cartItemId_vendorServiceOption_key" ON "OrderItemVendorServiceOption"("cartItemId", "vendorServiceOptionId");

-- CreateIndex
CREATE INDEX "Category_name_vendorTypeId_id_idx" ON "Category"("name", "vendorTypeId", "id");

-- CreateIndex
CREATE INDEX "Category_name_vendorTypeId_idx" ON "Category"("name", "vendorTypeId");

-- CreateIndex
CREATE INDEX "Category_id_vendorTypeId_idx" ON "Category"("id", "vendorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_vendorTypeId_key" ON "Category"("name", "vendorTypeId");

-- CreateIndex
CREATE INDEX "SubCategory_name_categoryId_id_idx" ON "SubCategory"("name", "categoryId", "id");

-- CreateIndex
CREATE INDEX "SubCategory_id_categoryId_idx" ON "SubCategory"("id", "categoryId");

-- CreateIndex
CREATE INDEX "SubCategory_categoryId_idx" ON "SubCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategory_name_categoryId_key" ON "SubCategory"("name", "categoryId");

-- CreateIndex
CREATE INDEX "Item_vendorId_idx" ON "Item"("vendorId");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_subCategoryId_idx" ON "Item"("subCategoryId");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Item_vendorId_categoryId_subCategoryId_idx" ON "Item"("vendorId", "categoryId", "subCategoryId");

-- CreateIndex
CREATE INDEX "Item_categoryId_subCategoryId_name_idx" ON "Item"("categoryId", "subCategoryId", "name");

-- CreateIndex
CREATE INDEX "Item_vendorId_name_idx" ON "Item"("vendorId", "name");

-- CreateIndex
CREATE INDEX "Item_id_vendorId_idx" ON "Item"("id", "vendorId");

-- CreateIndex
CREATE INDEX "Item_vendorId_categoryId_idx" ON "Item"("vendorId", "categoryId");

-- CreateIndex
CREATE INDEX "Item_vendorId_status_idx" ON "Item"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Item_productstatus_idx" ON "Item"("productstatus");

-- CreateIndex
CREATE INDEX "Item_remainingQty_idx" ON "Item"("remainingQty");

-- CreateIndex
CREATE INDEX "Item_dailyTotalQty_idx" ON "Item"("dailyTotalQty");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_vendorId_key" ON "Item"("name", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemImage_relativeUrl_key" ON "ItemImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ItemImage_absoluteUrl_key" ON "ItemImage"("absoluteUrl");

-- CreateIndex
CREATE INDEX "ItemImage_itemId_idx" ON "ItemImage"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");

-- CreateIndex
CREATE INDEX "Review_vendorId_idx" ON "Review"("vendorId");

-- CreateIndex
CREATE INDEX "Review_orderItemId_idx" ON "Review"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_vendorId_key" ON "Review"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_orderItemId_key" ON "Review"("userId", "orderItemId");

-- CreateIndex
CREATE INDEX "VendorServiceOption_vendorId_idx" ON "VendorServiceOption"("vendorId");

-- CreateIndex
CREATE INDEX "VendorServiceOption_serviceOptionId_idx" ON "VendorServiceOption"("serviceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorServiceOption_vendorId_serviceOptionId_key" ON "VendorServiceOption"("vendorId", "serviceOptionId");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_vendorId_serviceOptionId_key" ON "Service"("name", "vendorId", "serviceOptionId");

-- CreateIndex
CREATE INDEX "VendorSubService_serviceId_idx" ON "VendorSubService"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubService_name_serviceId_key" ON "VendorSubService"("name", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceImage_relativeUrl_key" ON "ServiceImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceImage_absoluteUrl_key" ON "ServiceImage"("absoluteUrl");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSettlement_vendorId_date_key" ON "OrderSettlement"("vendorId", "date");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_vendorTypeId_idx" ON "SubscriptionPlan"("vendorTypeId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_billingPeriod_idx" ON "SubscriptionPlan"("billingPeriod");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_status_idx" ON "SubscriptionPlan"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_name_idx" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_vendorTypeId_billingPeriod_key" ON "SubscriptionPlan"("name", "vendorTypeId", "billingPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_juspayOrderId_key" ON "Payment"("juspayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_purpose_referenceId_idx" ON "Payment"("purpose", "referenceId");

-- CreateIndex
CREATE INDEX "Payment_paymentPageExpiry_idx" ON "Payment"("paymentPageExpiry");

-- CreateIndex
CREATE INDEX "Payment_purpose_userId_status_idx" ON "Payment"("purpose", "userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_uniqueRequestId_key" ON "Refund"("uniqueRequestId");

-- CreateIndex
CREATE INDEX "ManualRefund_paymentId_idx" ON "ManualRefund"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubscription_paymentId_key" ON "VendorSubscription"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TempRegister_cacheKey_key" ON "TempRegister"("cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "FCMToken"("token");

-- CreateIndex
CREATE INDEX "FCMToken_userId_idx" ON "FCMToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_id_idx" ON "RefreshToken"("id");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_createdAt_idx" ON "RefreshToken"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BloodDetails_userId_key" ON "BloodDetails"("userId");

-- CreateIndex
CREATE INDEX "BloodRequest_userId_donorId_idx" ON "BloodRequest"("userId", "donorId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "Vendor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorType_name_key" ON "VendorType"("name");

-- CreateIndex
CREATE INDEX "Staff_id_vendorId_idx" ON "Staff"("id", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_vendorId_key" ON "Staff"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopInfo_vendorId_key" ON "ShopInfo"("vendorId");

-- CreateIndex
CREATE INDEX "shopinfo_location_idx" ON "ShopInfo" USING GIST ("location");

-- CreateIndex
CREATE INDEX "ShopInfo_name_idx" ON "ShopInfo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShopWorkingHour_shopId_dayOfWeek_key" ON "ShopWorkingHour"("shopId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseNo_key" ON "License"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "License_shopInfoId_key" ON "License"("shopInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "BankDetail_vendorId_key" ON "BankDetail"("vendorId");

-- CreateIndex
CREATE INDEX "BankDetail_upiId_idx" ON "BankDetail"("upiId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminVendorCredit_vendorId_key" ON "AdminVendorCredit"("vendorId");

-- AddForeignKey
ALTER TABLE "ShopCategory" ADD CONSTRAINT "ShopCategory_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreDefinedBanner" ADD CONSTRAINT "PreDefinedBanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordBanner" ADD CONSTRAINT "KeywordBanner_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordBanner" ADD CONSTRAINT "KeywordBanner_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerItemImages" ADD CONSTRAINT "BannerItemImages_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerVendorItem" ADD CONSTRAINT "BannerVendorItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerVendorItemsImage" ADD CONSTRAINT "BannerVendorItemsImage_bannerVendorItemId_fkey" FOREIGN KEY ("bannerVendorItemId") REFERENCES "BannerVendorItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_declinedBy_fkey" FOREIGN KEY ("declinedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_vendorSubServiceId_fkey" FOREIGN KEY ("vendorSubServiceId") REFERENCES "VendorSubService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerBooking" ADD CONSTRAINT "BannerBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerBooking" ADD CONSTRAINT "BannerBooking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicSelectOption" ADD CONSTRAINT "DynamicSelectOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "DynamicField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCustomerForVendor" ADD CONSTRAINT "FavouriteCustomerForVendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteCustomerForVendor" ADD CONSTRAINT "FavouriteCustomerForVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteVendorForCustomer" ADD CONSTRAINT "FavouriteVendorForCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteVendorForCustomer" ADD CONSTRAINT "FavouriteVendorForCustomer_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyWord" ADD CONSTRAINT "keyWord_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVendorKeyword" ADD CONSTRAINT "ServiceVendorKeyword_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "keyWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVendorKeyword" ADD CONSTRAINT "ServiceVendorKeyword_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_declinedBy_fkey" FOREIGN KEY ("declinedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES "WalletTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVendorServiceOption" ADD CONSTRAINT "OrderItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVendorServiceOption" ADD CONSTRAINT "OrderItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_productUnitId_fkey" FOREIGN KEY ("productUnitId") REFERENCES "ProductUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemImage" ADD CONSTRAINT "ItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceOption" ADD CONSTRAINT "VendorServiceOption_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceOption" ADD CONSTRAINT "VendorServiceOption_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubService" ADD CONSTRAINT "VendorSubService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceImage" ADD CONSTRAINT "ServiceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSettlement" ADD CONSTRAINT "OrderSettlement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualRefund" ADD CONSTRAINT "ManualRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualRefund" ADD CONSTRAINT "ManualRefund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubscription" ADD CONSTRAINT "VendorSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FCMToken" ADD CONSTRAINT "FCMToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodDetails" ADD CONSTRAINT "BloodDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReferral" ADD CONSTRAINT "VendorReferral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReferral" ADD CONSTRAINT "VendorReferral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorType" ADD CONSTRAINT "VendorType_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOption" ADD CONSTRAINT "ServiceOption_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInfo" ADD CONSTRAINT "ShopInfo_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInfo" ADD CONSTRAINT "ShopInfo_shopCategoryId_fkey" FOREIGN KEY ("shopCategoryId") REFERENCES "ShopCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopInfo" ADD CONSTRAINT "ShopInfo_shopCityId_fkey" FOREIGN KEY ("shopCityId") REFERENCES "ShopCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopWorkingHour" ADD CONSTRAINT "ShopWorkingHour_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "ShopInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_shopInfoId_fkey" FOREIGN KEY ("shopInfoId") REFERENCES "ShopInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_licenseCategoryId_fkey" FOREIGN KEY ("licenseCategoryId") REFERENCES "LicenseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_bankNameId_fkey" FOREIGN KEY ("bankNameId") REFERENCES "BankName"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankDetail" ADD CONSTRAINT "BankDetail_bankPaymentTypeId_fkey" FOREIGN KEY ("bankPaymentTypeId") REFERENCES "BankPaymentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_senderWalletId_fkey" FOREIGN KEY ("senderWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_receiverWalletId_fkey" FOREIGN KEY ("receiverWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminVendorCredit" ADD CONSTRAINT "AdminVendorCredit_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
