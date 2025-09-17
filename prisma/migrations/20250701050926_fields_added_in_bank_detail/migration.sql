-- CreateEnum
CREATE TYPE "BankPlatformType" AS ENUM ('AMAZON_PAY', 'GOOGLE_PAY', 'PHONE_PAY', 'PAYTM');

-- AlterTable
ALTER TABLE "BankDetail" ADD COLUMN     "bankPlatformType" "BankPlatformType",
ADD COLUMN     "linkedPhoneNumber" TEXT;

-- AlterTable
ALTER TABLE "BannerVendorItem" ADD COLUMN     "expiryDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "expiryDate" TIMESTAMP(3);
