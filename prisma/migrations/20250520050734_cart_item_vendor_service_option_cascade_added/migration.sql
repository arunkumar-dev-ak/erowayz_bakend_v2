-- DropForeignKey
ALTER TABLE "CartItemVendorServiceOption" DROP CONSTRAINT "CartItemVendorServiceOption_cartItemId_fkey";

-- DropForeignKey
ALTER TABLE "CartItemVendorServiceOption" DROP CONSTRAINT "CartItemVendorServiceOption_vendorServiceOptionId_fkey";

-- AddForeignKey
ALTER TABLE "CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_vendorServiceOptionId_fkey" FOREIGN KEY ("vendorServiceOptionId") REFERENCES "VendorServiceOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemVendorServiceOption" ADD CONSTRAINT "CartItemVendorServiceOption_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
