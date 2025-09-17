-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "ShopWorkingHour" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openTime" TIMESTAMP(3),
    "closeTime" TIMESTAMP(3),
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ShopWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopWorkingHour_shopId_dayOfWeek_key" ON "ShopWorkingHour"("shopId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "ShopWorkingHour" ADD CONSTRAINT "ShopWorkingHour_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "ShopInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
