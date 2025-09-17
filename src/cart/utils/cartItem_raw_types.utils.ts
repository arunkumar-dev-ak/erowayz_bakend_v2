import { ProductStatus, Status } from '@prisma/client';

export type CartItemWithItem = {
  // From CartItem
  id: string;
  cartId: string;
  itemId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  // From Item
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  minSellingQty: number;
  vendorId: string;
  categoryId: string;
  subCategoryId: string;
  quantityUnit: string;
  dailyTotalQty: number;
  remainingQty: number;
  productstatus: ProductStatus;
  status: Status;
  totalQtyEditCount: number;

  // From CartItemVendorServiceOption
  cartItemVendorServiceOptionId: string;
  vendorServiceOptionId: string;
};
