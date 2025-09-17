-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- AlterTable
ALTER TABLE "ShopInfo" ADD COLUMN     "location" geography(Point,4326);
