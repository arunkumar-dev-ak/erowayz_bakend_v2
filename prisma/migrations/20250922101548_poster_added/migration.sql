/*
  Warnings:

  - You are about to drop the column `image` on the `VideoLink` table. All the data in the column will be lost.
  - Added the required column `userType` to the `Disclaimer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `PrivacyPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `TermsAndCondition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heading` to the `VideoLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `VideoLink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'VENDOR');

-- AlterTable
ALTER TABLE "Disclaimer" ADD COLUMN     "userType" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "PrivacyPolicy" ADD COLUMN     "userType" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "TermsAndCondition" ADD COLUMN     "userType" "UserType" NOT NULL;

-- AlterTable
ALTER TABLE "VideoLink" DROP COLUMN "image",
ADD COLUMN     "heading" TEXT NOT NULL,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

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
CREATE TABLE "VendorReferral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorReferral_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendorReferral" ADD CONSTRAINT "VendorReferral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReferral" ADD CONSTRAINT "VendorReferral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
