-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('FISSAI', 'UDYAM');

-- AlterTable
ALTER TABLE "License" ADD COLUMN     "licenseType" "LicenseType";
