import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFoodPreferenceDto } from '../dto/create-food-preference.dto';

/**
 * Validates SubCategories existence and unique preference name before creation.
 */
export async function validateFoodPreferenceCreation({
  prisma,
  body,
}: {
  prisma: PrismaService;
  body: CreateFoodPreferenceDto;
}) {
  const { name, nameTamil, subCategoryIds } = body;

  const uniqueSubCategoryIds = [...new Set(subCategoryIds)];

  const existingSubCats = await prisma.subCategory.findMany({
    where: { id: { in: uniqueSubCategoryIds } },
    select: { id: true },
  });
  if (existingSubCats.length !== uniqueSubCategoryIds.length) {
    throw new NotFoundException(
      'One or more specified SubCategories do not exist',
    );
  }

  const trimmedName = name.trim();
  const existing = await prisma.foodPreference.findFirst({
    where: {
      name: { equals: trimmedName, mode: 'insensitive' },
    },
    select: { id: true },
  });
  if (existing) {
    throw new ConflictException(
      `Food preference "${trimmedName}" already exists`,
    );
  }

  return {
    trimmedName,
    trimmedNameTamil: nameTamil.trim(),
    uniqueSubCategoryIds,
  };
}
