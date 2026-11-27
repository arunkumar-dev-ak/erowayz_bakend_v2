import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { validateFoodPreferenceCreation } from './utils/create-food-preference.utils';
import { validateFoodPreferenceUpdate } from './utils/update-food-preference.utils';
import { buildAdminFoodPreferenceWhereFilter } from './utils/get-food-preference.utils';
import { validateOrderFoodPreferences } from 'src/order/utils/order.utils';

describe('FoodPreference Many-to-Many Implementation', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      subCategory: {
        findMany: jest.fn(),
      },
      foodPreference: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
  });

  describe('validateFoodPreferenceCreation', () => {
    it('successfully validates creation with multiple unique subcategories', async () => {
      mockPrisma.subCategory.findMany.mockResolvedValue([
        { id: 'sub-1' },
        { id: 'sub-2' },
      ]);
      mockPrisma.foodPreference.findFirst.mockResolvedValue(null);

      const result = await validateFoodPreferenceCreation({
        prisma: mockPrisma as unknown as PrismaService,
        body: {
          name: '  Less Spicy  ',
          nameTamil: '  காரம் குறைவாக  ',
          subCategoryIds: ['sub-1', 'sub-2', 'sub-1'], // Duplicate sub-1 should deduplicate
        },
      });

      expect(result.trimmedName).toBe('Less Spicy');
      expect(result.trimmedNameTamil).toBe('காரம் குறைவாக');
      expect(result.uniqueSubCategoryIds).toEqual(['sub-1', 'sub-2']);
    });

    it('throws NotFoundException if any subCategory does not exist', async () => {
      mockPrisma.subCategory.findMany.mockResolvedValue([{ id: 'sub-1' }]);

      await expect(
        validateFoodPreferenceCreation({
          prisma: mockPrisma as unknown as PrismaService,
          body: {
            name: 'Less Spicy',
            nameTamil: 'காரம் குறைவாக',
            subCategoryIds: ['sub-1', 'sub-missing'],
          },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if a food preference with the same name already exists', async () => {
      mockPrisma.subCategory.findMany.mockResolvedValue([{ id: 'sub-1' }]);
      mockPrisma.foodPreference.findFirst.mockResolvedValue({
        id: 'existing-id',
      });

      await expect(
        validateFoodPreferenceCreation({
          prisma: mockPrisma as unknown as PrismaService,
          body: {
            name: 'Less Spicy',
            nameTamil: 'காரம் குறைவாக',
            subCategoryIds: ['sub-1'],
          },
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateFoodPreferenceUpdate', () => {
    it('properly prepares M:N subcategory update structure', async () => {
      mockPrisma.foodPreference.findUnique.mockResolvedValue({
        id: 'pref-1',
        name: 'Less Spicy',
      });
      mockPrisma.foodPreference.findFirst.mockResolvedValue(null);
      mockPrisma.subCategory.findMany.mockResolvedValue([
        { id: 'sub-1' },
        { id: 'sub-3' },
      ]);

      const updateInput = await validateFoodPreferenceUpdate({
        prisma: mockPrisma as unknown as PrismaService,
        id: 'pref-1',
        body: {
          name: 'Extra Spicy',
          subCategoryIds: ['sub-1', 'sub-3'],
        },
      });

      expect(updateInput.name).toBe('Extra Spicy');
      expect(updateInput.subCategories).toEqual({
        deleteMany: {},
        create: [{ subCategoryId: 'sub-1' }, { subCategoryId: 'sub-3' }],
      });
    });
  });

  describe('buildAdminFoodPreferenceWhereFilter', () => {
    it('filters by subCategoryId using relation some filter', () => {
      const where = buildAdminFoodPreferenceWhereFilter({
        query: { subCategoryId: 'sub-1' },
      });

      expect(where.subCategories).toEqual({
        some: { subCategoryId: 'sub-1' },
      });
    });
  });

  describe('validateOrderFoodPreferences', () => {
    it('validates order food preferences against cart items through relation', async () => {
      mockPrisma.foodPreference.findMany.mockResolvedValue([{ id: 'pref-1' }]);

      const validIds = await validateOrderFoodPreferences({
        prisma: mockPrisma as unknown as PrismaService,
        foodPreferenceIds: ['pref-1'],
        cartItems: [
          {
            id: 'cart-item-1',
            subCategoryId: 'sub-biryani',
          } as any,
        ],
      });

      expect(validIds).toEqual(['pref-1']);
      expect(mockPrisma.foodPreference.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['pref-1'] },
          isActive: true,
          subCategories: {
            some: {
              subCategoryId: { in: ['sub-biryani'] },
            },
          },
        },
        select: { id: true },
      });
    });

    it('throws BadRequestException when selected food preferences exceed the maximum limit', async () => {
      await expect(
        validateOrderFoodPreferences({
          prisma: mockPrisma as unknown as PrismaService,
          foodPreferenceIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
          cartItems: [{ id: 'cart-item-1', subCategoryId: 'sub-biryani' } as any],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
