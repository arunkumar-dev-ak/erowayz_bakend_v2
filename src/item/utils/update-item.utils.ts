import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateItemDto } from '../dto/update-item.dto';
import {
  Category,
  Item,
  ItemImage,
  OrderItem,
  Prisma,
  SubCategory,
  Vendor,
  VendorSubscription,
} from '@prisma/client';
import { CategoryService } from 'src/category/category.service';
import { SubCategoryService } from 'src/sub-category/sub-category.service';
import { calculateQtyDifference } from '../function/calculateQtydifference';
import { ItemService } from '../item.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

export const UpdateItemVerification = async ({
  body,
  item,
  categoryService,
  subCategoryService,
  itemService,
  vendorId,
  vendorSubscriptionService,
  currentVendorSubscription,
}: {
  body: UpdateItemDto;
  item: Item & {
    vendor: Vendor;
    category: Category;
    subCategory: SubCategory;
    itemImage: ItemImage[];
    orderItems: OrderItem[];
  };
  categoryService: CategoryService;
  subCategoryService: SubCategoryService;
  itemService: ItemService;
  vendorId: string;
  vendorSubscriptionService: VendorSubscriptionService;
  currentVendorSubscription: VendorSubscription;
}) => {
  let updateVendorUsageQuery: Prisma.VendorFeatureUsageUpdateArgs | null = null;

  //check unique name
  if (body.name) {
    const existingNameItem = await itemService.findItemByName(
      body.name,
      vendorId,
    );
    if (existingNameItem && existingNameItem.id !== item.id) {
      throw new BadRequestException(`${body.name} is already present`);
    }
  }

  // Restrict updates if item is associated with an order
  if (
    item.orderItems &&
    item.orderItems.length > 0 &&
    (body.name || body.productUnitId || body.categoryId || body.subCategoryId)
  ) {
    throw new BadRequestException(
      'Name and Product Unit cannot be updated while item has active orders',
    );
  }

  //check category
  const category = body.categoryId
    ? await categoryService.findCategoryByVendorType({
        vendorTypeId: item.vendor.vendorTypeId,
        categoryId: body.categoryId,
      })
    : undefined;
  if (body.categoryId && !category) {
    throw new NotFoundException(
      'Category Not found or not associated with Selected VendorType of Vendor',
    );
  }

  //check subCategory
  const subCategory = body.subCategoryId
    ? await subCategoryService.getSubCategoryByIdAndCategory({
        subCategoryId: body.subCategoryId,
        categoryId: body.categoryId || item.categoryId,
      })
    : undefined;
  if (body.subCategoryId && !subCategory) {
    throw new NotFoundException(
      'Subcategory not found or not associated with categoryId',
    );
  }

  // Validate minSellingQty constraints
  if (
    body.minSellingQty &&
    ((body.dailyTotalQty && body.minSellingQty > body.dailyTotalQty) ||
      body.minSellingQty > item.dailyTotalQty)
  ) {
    throw new BadRequestException(
      'Min selling quantity cannot be greater than daily total quantity',
    );
  }
  if (body.dailyTotalQty && body.dailyTotalQty < item.minSellingQty) {
    throw new BadRequestException(
      'Daily total quantity cannot be less than min selling quantity',
    );
  }

  const { deletedItemImageIds } = body;
  let deletedImages: ItemImage[] = [];
  //check deleted images
  if (deletedItemImageIds) {
    deletedImages = await itemService.findItemImages(deletedItemImageIds);
    if (deletedImages.length !== deletedItemImageIds.length) {
      throw new BadRequestException(
        'Apologies for the reason.Some of the Deleted Image Ids not found',
      );
    }
  }

  //handle item count update
  if (body.dailyTotalQty) {
    const vendorFeatureUsageForQtyUpdate =
      await vendorSubscriptionService.getOrCreateFeatureUsage({
        vendorSubscriptionId: currentVendorSubscription.id,
        itemId: item.id,
        feature: 'qtyUpdateLimit',
      });
    const planQtyUpdateLimit = (
      vendorFeatureUsageForQtyUpdate.vendorSubscription.planFeatures as Record<
        string,
        any
      >
    )['qtyUpdateLimit'] as number | null;
    if (!planQtyUpdateLimit) {
      throw new BadRequestException(
        'You are not allowed to update the quantity',
      );
    }
    if (vendorFeatureUsageForQtyUpdate.usageCount >= planQtyUpdateLimit) {
      throw new BadRequestException(
        'You have reached the limit to update the quantity',
      );
    }

    updateVendorUsageQuery = {
      where: {
        id: vendorFeatureUsageForQtyUpdate.id,
      },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    };
  }

  // Determine remainingQty change
  let updatedRemainingQty = item.remainingQty;
  let totalQtyEditCount: number = item.totalQtyEditCount;

  if (
    body.dailyTotalQty !== undefined &&
    body.dailyTotalQty !== item.dailyTotalQty
  ) {
    updatedRemainingQty = calculateQtyDifference({
      remainingQty: updatedRemainingQty,
      bodyDailyTotalQty: body.dailyTotalQty,
      itemDailyTotalQty: item.dailyTotalQty,
    });

    totalQtyEditCount++;
  }

  //checking discount price
  if (!body.price && body.discountPrice && body.discountPrice >= item.price) {
    throw new ConflictException(
      'Discounted price must be Smaller than the Product Price',
    );
  }

  return {
    updatedRemainingQty,
    totalQtyEditCount,
    deletedImages,
    updateVendorUsageQuery,
  };
};
