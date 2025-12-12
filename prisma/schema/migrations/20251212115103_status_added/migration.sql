-- AlterTable
ALTER TABLE "public"."Banner" ALTER COLUMN "productUnitId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."ServiceOption" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."SubCategory" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."VendorType" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';
