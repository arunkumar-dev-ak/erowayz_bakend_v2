-- CreateEnum
CREATE TYPE "fgBannerImagePosition" AS ENUM ('LEFT', 'RIGHT');

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "fgImagePosition" "fgBannerImagePosition";
