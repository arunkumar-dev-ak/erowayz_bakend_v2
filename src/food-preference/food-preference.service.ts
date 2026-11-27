import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateFoodPreferenceDto } from './dto/create-food-preference.dto';
import { GetAdminFoodPreferenceQueryDto } from './dto/get-admin-food-preference-query.dto';
import { GetCustomerFoodPreferenceQueryDto } from './dto/get-customer-food-preference-query.dto';
import { UpdateFoodPreferenceDto } from './dto/update-food-preference.dto';
import { validateFoodPreferenceCreation } from './utils/create-food-preference.utils';
import {
  buildAdminFoodPreferenceWhereFilter,
  fetchCustomerCartWithSubCategories,
  fetchPaginatedFoodPreferencesForSubCategories,
} from './utils/get-food-preference.utils';
import {
  validateFoodPreferenceDeletion,
  validateFoodPreferenceUpdate,
} from './utils/update-food-preference.utils';

@Injectable()
export class FoodPreferenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metadataService: MetadataService,
  ) {}

  /**
   * Customer: Validates cart ownership, resolves unique subcategories in cart,
   * and returns paginated active bilingual food preferences.
   */
  async getCustomerFoodPreferences({
    userId,
    query,
    res,
  }: {
    userId: string;
    query: GetCustomerFoodPreferenceQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '10');

    const { cart, uniqueSubCategoryIds } =
      await fetchCustomerCartWithSubCategories({
        prisma: this.prisma,
        userId,
        cartId: query.cartId,
      });

    const queries = buildQueryParams({
      cartId: cart?.id,
    });

    const maxSelectionLimit =
      Number(process.env.MAX_FOOD_PREFERENCES_PER_ORDER) || 5;

    if (!cart || uniqueSubCategoryIds.length === 0) {
      const emptyMeta = this.metadataService.createMetaData({
        totalCount: 0,
        offset,
        limit,
        path: 'food-preference/customer',
        queries,
      });

      return this.response.successResponse({
        res,
        data: {
          maxSelectionLimit,
          preferences: [],
        },
        meta: {
          ...emptyMeta,
          maxSelectionLimit,
        },
        message: 'Food preferences retrieved successfully',
        statusCode: 200,
        initialDate,
      });
    }

    const { totalCount, preferences } =
      await fetchPaginatedFoodPreferencesForSubCategories({
        prisma: this.prisma,
        uniqueSubCategoryIds,
        offset,
        limit,
      });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'food-preference/customer',
      queries,
    });

    return this.response.successResponse({
      res,
      data: {
        maxSelectionLimit,
        preferences,
      },
      meta: {
        ...meta,
        maxSelectionLimit,
      },
      message: 'Food preferences retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /**
   * Admin: List all food preferences with filtering & pagination
   */
  async getAllAdmin({
    query,
    res,
  }: {
    query: GetAdminFoodPreferenceQueryDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { subCategoryId, isActive, search } = query;
    const offset = Number(query.offset || '0');
    const limit = Number(query.limit || '10');

    const where = buildAdminFoodPreferenceWhereFilter({ query });

    const [totalCount, preferences] = await Promise.all([
      this.prisma.foodPreference.count({ where }),
      this.prisma.foodPreference.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subCategories: {
            select: {
              id: true,
              subCategoryId: true,
              subCategory: {
                select: {
                  id: true,
                  name: true,
                  categoryId: true,
                },
              },
            },
          },
          _count: {
            select: {
              orderFoodPreferences: true,
            },
          },
        },
      }),
    ]);

    const queries = buildQueryParams({
      subCategoryId,
      isActive,
      search,
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'food-preference/admin',
      queries,
    });

    return this.response.successResponse({
      res,
      data: preferences,
      meta,
      message: 'Food preferences retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /**
   * Admin: Create a new bilingual food preference mapped to a SubCategory (1:M)
   */
  async create({
    body,
    res,
  }: {
    body: CreateFoodPreferenceDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const { trimmedName, trimmedNameTamil, uniqueSubCategoryIds } =
      await validateFoodPreferenceCreation({
        prisma: this.prisma,
        body,
      });

    const created = await this.prisma.foodPreference.create({
      data: {
        name: trimmedName,
        nameTamil: trimmedNameTamil,
        isActive: body.isActive ?? true,
        subCategories: {
          create: uniqueSubCategoryIds.map((subCategoryId) => ({
            subCategoryId,
          })),
        },
      },
      include: {
        subCategories: {
          include: {
            subCategory: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return this.response.successResponse({
      res,
      data: created,
      message: 'Food preference created successfully',
      statusCode: 201,
      initialDate,
    });
  }

  /**
   * Admin: Update an existing food preference
   */
  async update({
    id,
    body,
    res,
  }: {
    id: string;
    body: UpdateFoodPreferenceDto;
    res: Response;
  }) {
    const initialDate = new Date();
    const updateData = await validateFoodPreferenceUpdate({
      prisma: this.prisma,
      id,
      body,
    });

    const updated = await this.prisma.foodPreference.update({
      where: { id },
      data: updateData,
      include: {
        subCategories: {
          include: {
            subCategory: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return this.response.successResponse({
      res,
      data: updated,
      message: 'Food preference updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /**
   * Admin: Delete a food preference (cascades & unlinks from orders cleanly)
   */
  async delete({ id, res }: { id: string; res: Response }) {
    const initialDate = new Date();
    await validateFoodPreferenceDeletion({ prisma: this.prisma, id });

    const deleted = await this.prisma.foodPreference.delete({
      where: { id },
    });

    return this.response.successResponse({
      res,
      data: deleted,
      message: 'Food preference deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }
}
