/*
  Warnings:

  - The values [VENDORT_TYPE] on the enum `KeyWordType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "KeyWordType_new" AS ENUM ('BANNER', 'VENDOR_TYPE');
ALTER TABLE "keyWord" ALTER COLUMN "keyWordType" TYPE "KeyWordType_new" USING ("keyWordType"::text::"KeyWordType_new");
ALTER TYPE "KeyWordType" RENAME TO "KeyWordType_old";
ALTER TYPE "KeyWordType_new" RENAME TO "KeyWordType";
DROP TYPE "KeyWordType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LicenseType" ADD VALUE 'AADHAR';
ALTER TYPE "LicenseType" ADD VALUE 'DRIVING_LICENSE';
