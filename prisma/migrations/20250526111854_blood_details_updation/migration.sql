/*
  Warnings:

  - You are about to drop the column `latitude` on the `BloodRequest` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `BloodRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `BloodRequest` table. All the data in the column will be lost.
  - Added the required column `patientMobileNumber` to the `BloodRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BloodRequest" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "status",
ADD COLUMN     "patientMobileNumber" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BloodRequestStatus";
