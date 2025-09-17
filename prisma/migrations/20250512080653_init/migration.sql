-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('PRODUCT', 'REGULAR');

-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('NOT_STARTED', 'INITIATED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PENDING', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'JUSPAY');

-- CreateEnum
CREATE TYPE "DeclineByType" AS ENUM ('VENDOR', 'CUSTOMER', 'SYSTEM', 'STAFF');

-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('GENERAL', 'KG', 'GRAM', 'BOX', 'SET', 'PIECE', 'LITRE', 'MILLILITRE', 'UNIT', 'SERVE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'VENDOR', 'STAFF');

-- CreateEnum
CREATE TYPE "BloodGroups" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "VendorCategoryType" AS ENUM ('SERVICE', 'PRODUCT', 'BANNER');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'NUMBER', 'DROPDOWN');

-- CreateTable
CREATE TABLE "PreDefinedBanner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
CREATE TABLE "BannerProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bannerType" "BannerType" NOT NULL DEFAULT 'REGULAR',
    "description" TEXT,
    "vendorId" TEXT NOT NULL,
    "textColor" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bgColor" TEXT,
    "bgImageRef" TEXT,
    "bgImageRelativeUrl" TEXT,
    "fgImageRef" TEXT,
    "fgImageRelativeUrl" TEXT,
    "minApplyValue" INTEGER NOT NULL,
    "offerType" "OfferType" NOT NULL,
    "offerValue" INTEGER NOT NULL,
    "status" "BannerStatus" NOT NULL DEFAULT 'ACTIVE',
    "originalPricePerUnit" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "qtyUnit" "QuantityUnit",

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "BannerItems" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerItems_pkey" PRIMARY KEY ("id")
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "vendorSubServiceId" TEXT NOT NULL,

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
    "vendorServiceOptionId" TEXT NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderPaymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
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

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityUnit" "QuantityUnit" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorServiceOptionId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
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
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "minSellingQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subCategoryId" TEXT NOT NULL,
    "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'GENERAL',
    "dailyTotalQty" DOUBLE PRECISION NOT NULL,
    "remainingQty" DOUBLE PRECISION NOT NULL,
    "productstatus" "ProductStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "totalQtyEditCount" INTEGER NOT NULL DEFAULT 0,

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
CREATE TABLE "SubService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceOptionId" TEXT NOT NULL,

    CONSTRAINT "SubService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorServiceOption" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "serviceOptionId" TEXT NOT NULL,
    "isLaunched" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "VendorServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorSubServicePricing" (
    "id" TEXT NOT NULL,
    "subServiceId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendorServiceOptId" TEXT NOT NULL,

    CONSTRAINT "VendorSubServicePricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "imageRef" TEXT,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "mobile" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "salt" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageRef" TEXT,
    "shopDynamicFields" JSONB,
    "type" "VendorCategoryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "relativeUrl" TEXT,

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
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "shopImageRef" TEXT,
    "istermsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "dynamicValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isShopOpen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShopInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "shopInfoId" TEXT NOT NULL,
    "isLicenseApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreDefinedBanner_name_key" ON "PreDefinedBanner"("name");

-- CreateIndex
CREATE INDEX "PreDefinedBanner_id_name_idx" ON "PreDefinedBanner"("id", "name");

-- CreateIndex
CREATE INDEX "Banner_id_vendorId_idx" ON "Banner"("id", "vendorId");

-- CreateIndex
CREATE INDEX "Banner_id_name_vendorId_idx" ON "Banner"("id", "name", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_name_vendorId_key" ON "Banner"("name", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "BannerItems_itemId_bannerId_key" ON "BannerItems"("itemId", "bannerId");

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
CREATE INDEX "Cart_id_userId_idx" ON "Cart"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_vendorId_key" ON "Cart"("userId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_itemId_key" ON "CartItem"("cartId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_orderStatus_idx" ON "Order"("orderStatus");

-- CreateIndex
CREATE INDEX "Order_orderStatus_expiryAt_id_idx" ON "Order"("orderStatus", "expiryAt", "id");

-- CreateIndex
CREATE INDEX "OrderItem_vendorServiceOptionId_idx" ON "OrderItem"("vendorServiceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_itemId_orderId_key" ON "OrderItem"("itemId", "orderId");

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
CREATE UNIQUE INDEX "ItemImage_relativeUrl_key" ON "ItemImage"("relativeUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ItemImage_absoluteUrl_key" ON "ItemImage"("absoluteUrl");

-- CreateIndex
CREATE INDEX "ItemImage_itemId_idx" ON "ItemImage"("itemId");

-- CreateIndex
CREATE INDEX "SubService_serviceOptionId_id_idx" ON "SubService"("serviceOptionId", "id");

-- CreateIndex
CREATE INDEX "SubService_name_serviceOptionId_id_idx" ON "SubService"("name", "serviceOptionId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "SubService_name_serviceOptionId_key" ON "SubService"("name", "serviceOptionId");

-- CreateIndex
CREATE INDEX "VendorServiceOption_vendorId_idx" ON "VendorServiceOption"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorServiceOption_vendorId_serviceOptionId_key" ON "VendorServiceOption"("vendorId", "serviceOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorSubServicePricing_vendorServiceOptId_subServiceId_key" ON "VendorSubServicePricing"("vendorServiceOptId", "subServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

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
CREATE INDEX "OTP_userId_idx" ON "OTP"("userId");

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
CREATE UNIQUE INDEX "License_licenseNo_key" ON "License"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "License_shopInfoId_key" ON "License"("shopInfoId");

-- AddForeignKey
ALTER TABLE "PreDefinedBanner" ADD CONSTRAINT "PreDefinedBanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerProduct" ADD CONSTRAINT "BannerProduct_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerItemImages" ADD CONSTRAINT "BannerItemImages_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerItems" ADD CONSTRAINT "BannerItems_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerItems" ADD CONSTRAINT "BannerItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_declinedBy_fkey" FOREIGN KEY ("declinedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_vendorSubServiceId_fkey" FOREIGN KEY ("vendorSubServiceId") REFERENCES "VendorSubServicePricing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_declinedBy_fkey" FOREIGN KEY ("declinedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "ItemImage" ADD CONSTRAINT "ItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubService" ADD CONSTRAINT "SubService_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceOption" ADD CONSTRAINT "VendorServiceOption_serviceOptionId_fkey" FOREIGN KEY ("serviceOptionId") REFERENCES "ServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceOption" ADD CONSTRAINT "VendorServiceOption_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubServicePricing" ADD CONSTRAINT "VendorSubServicePricing_subServiceId_fkey" FOREIGN KEY ("subServiceId") REFERENCES "SubService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorSubServicePricing" ADD CONSTRAINT "VendorSubServicePricing_vendorServiceOptId_fkey" FOREIGN KEY ("vendorServiceOptId") REFERENCES "VendorServiceOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodDetails" ADD CONSTRAINT "BloodDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_vendorTypeId_fkey" FOREIGN KEY ("vendorTypeId") REFERENCES "VendorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "License" ADD CONSTRAINT "License_shopInfoId_fkey" FOREIGN KEY ("shopInfoId") REFERENCES "ShopInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
