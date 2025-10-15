import { Prisma, Role } from '@prisma/client';
import { GetItemQueryDto } from '../dto/get-item-query.dto';
import {
  ShopStatusBooleanMap,
  UserStatusBooleanMap,
} from 'src/vendor/dto/get-vendor-query.dto';

export function buildItemWhereFilter({
  query,
  userRole,
}: {
  query: GetItemQueryDto;
  userRole?: Role;
}): Prisma.ItemWhereInput {
  const {
    categoryName,
    subCategoryName,
    categoryId,
    subCategoryId,
    itemName,
    vendorId,
    itemStatus,
    vendorStatus,
    shopStatus,
    productStatus,
    itemId,
  } = query;

  const currentDate = new Date();

  const where: Prisma.ItemWhereInput = {
    vendor: {
      User: {
        status: true,
      },
      ...(userRole !== 'VENDOR' && userRole !== 'STAFF'
        ? {
            vendorSubscription: {
              some: {
                endDate: {
                  gte: currentDate,
                },
                isActive: true,
              },
            },
          }
        : {}),
    },
  };

  if (itemId) {
    where.id = itemId;
  }

  if (categoryName) {
    where.category = { name: { contains: categoryName, mode: 'insensitive' } };
  }
  if (categoryId) where.categoryId = categoryId;
  if (subCategoryId) where.subCategoryId = subCategoryId;
  if (subCategoryName) {
    where.subCategory = {
      name: { contains: subCategoryName, mode: 'insensitive' },
    };
  }
  if (vendorId) where.vendorId = vendorId;
  if (itemName) where.name = { contains: itemName, mode: 'insensitive' };
  if (itemStatus) {
    where.status = itemStatus;
  }
  if (vendorStatus || shopStatus) {
    where.vendor = {
      is: {
        ...(vendorStatus && {
          User: {
            status: UserStatusBooleanMap[vendorStatus],
          },
        }),
        ...(shopStatus && {
          shopStatus: ShopStatusBooleanMap[shopStatus],
        }),
      },
    };
  }
  if (productStatus) {
    where.productstatus = productStatus;
  }

  return where;
}
