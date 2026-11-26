import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAdminFoodPreferenceQueryDto } from '../dto/get-admin-food-preference-query.dto';

/**
 * Builds the Prisma where clause for Admin food preference listings.
 */
export function buildAdminFoodPreferenceWhereFilter({
  query,
}: {
  query: GetAdminFoodPreferenceQueryDto;
}): Prisma.FoodPreferenceWhereInput {
  const { subCategoryId, isActive, search } = query;
  const where: Prisma.FoodPreferenceWhereInput = {};

  if (subCategoryId) {
    where.subCategories = {
      some: { subCategoryId },
    };
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true' || isActive === '1';
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameTamil: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

/**
 * Validates customer cart ownership and extracts deduplicated SubCategory IDs.
 */
export async function fetchCustomerCartWithSubCategories({
  prisma,
  userId,
  cartId,
}: {
  prisma: PrismaService;
  userId: string;
  cartId?: string;
}) {
  const cart = cartId
    ? await prisma.cart.findFirst({
        where: { id: cartId, userId },
        include: {
          cartItem: {
            select: {
              item: {
                select: { subCategoryId: true },
              },
            },
          },
        },
      })
    : await prisma.cart.findFirst({
        where: { userId },
        include: {
          cartItem: {
            select: {
              item: {
                select: { subCategoryId: true },
              },
            },
          },
        },
      });

  if (!cart) {
    if (cartId) {
      throw new NotFoundException(
        'Cart not found or does not belong to the authenticated user',
      );
    }
    return { cart: null, uniqueSubCategoryIds: [] as string[] };
  }

  const uniqueSubCategoryIds = [
    ...new Set(cart.cartItem.map((ci) => ci.item.subCategoryId)),
  ];

  return { cart, uniqueSubCategoryIds };
}

/**
 * Fetches paginated active food preferences matching a list of unique SubCategory IDs.
 */
export async function fetchPaginatedFoodPreferencesForSubCategories({
  prisma,
  uniqueSubCategoryIds,
  offset,
  limit,
}: {
  prisma: PrismaService;
  uniqueSubCategoryIds: string[];
  offset: number;
  limit: number;
}) {
  const where: Prisma.FoodPreferenceWhereInput = {
    isActive: true,
    subCategories: {
      some: {
        subCategoryId: { in: uniqueSubCategoryIds },
      },
    },
  };

  const [totalCount, preferences] = await Promise.all([
    prisma.foodPreference.count({ where }),
    prisma.foodPreference.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        nameTamil: true,
        subCategories: {
          select: {
            subCategoryId: true,
            subCategory: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return { totalCount, preferences };
}
