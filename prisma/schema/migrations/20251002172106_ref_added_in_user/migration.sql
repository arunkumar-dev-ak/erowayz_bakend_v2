-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "referrerId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
