-- CreateEnum
CREATE TYPE "public"."BookingPaymentMethod" AS ENUM ('CASH', 'JUSPAY');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "preferredPaymentMethod" "public"."BookingPaymentMethod" NOT NULL DEFAULT 'CASH';
