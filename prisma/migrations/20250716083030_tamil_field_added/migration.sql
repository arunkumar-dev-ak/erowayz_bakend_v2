-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('CART', 'SHOP');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "descriptionTamil" TEXT,
ADD COLUMN     "nameTamil" TEXT;

-- AlterTable
ALTER TABLE "ShopInfo" ADD COLUMN     "addressTamil" TEXT,
ADD COLUMN     "nameTamil" TEXT,
ADD COLUMN     "shopType" "ShopType";

-- AlterTable
ALTER TABLE "ShopWorkingHour" ADD COLUMN     "area" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nameTamil" TEXT;
