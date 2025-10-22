-- CreateEnum
CREATE TYPE "public"."PrivacyPolicyType" AS ENUM ('COINS', 'UPI', 'BLOOD');

-- CreateEnum
CREATE TYPE "public"."TermsAndConditionType" AS ENUM ('COINS', 'UPI', 'BLOOD');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."DisclaimerType" ADD VALUE 'COINS';
ALTER TYPE "public"."DisclaimerType" ADD VALUE 'UPI';
ALTER TYPE "public"."DisclaimerType" ADD VALUE 'BLOOD';

-- AlterTable
ALTER TABLE "public"."PrivacyPolicy" ADD COLUMN     "type" "public"."PrivacyPolicyType";

-- AlterTable
ALTER TABLE "public"."TermsAndCondition" ADD COLUMN     "type" "public"."TermsAndConditionType";
