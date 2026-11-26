import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateFoodPreferenceDto } from '../dto/update-food-preference.dto';

/**
 * Validates preference existence, target SubCategories, and uniqueness before updating.
 */
export async function validateFoodPreferenceUpdate({
  prisma,
  id,
  body,
}: {
  prisma: PrismaService;
  id: string;
  body: UpdateFoodPreferenceDto;
}): Promise<Prisma.FoodPreferenceUpdateInput> {
  const existing = await prisma.foodPreference.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new NotFoundException(`Food preference with ID ${id} not found`);
  }

  if (body.name) {
    const targetName = body.name.trim();
    const duplicate = await prisma.foodPreference.findFirst({
      where: {
        id: { not: id },
        name: { equals: targetName, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(
        `Food preference "${targetName}" already exists`,
      );
    }
  }

  if (body.subCategoryIds) {
    const uniqueSubCatIds = [...new Set(body.subCategoryIds)];
    const existingSubCats = await prisma.subCategory.findMany({
      where: { id: { in: uniqueSubCatIds } },
      select: { id: true },
    });
    if (existingSubCats.length !== uniqueSubCatIds.length) {
      throw new NotFoundException(
        'One or more specified SubCategories do not exist',
      );
    }
  }

  return {
    ...(body.name !== undefined && { name: body.name.trim() }),
    ...(body.nameTamil !== undefined && {
      nameTamil: body.nameTamil.trim(),
    }),
    ...(body.isActive !== undefined && { isActive: body.isActive }),
    ...(body.subCategoryIds !== undefined && {
      subCategories: {
        deleteMany: {},
        create: [...new Set(body.subCategoryIds)].map((subCategoryId) => ({
          subCategoryId,
        })),
      },
    }),
  };
}

/**
 * Validates food preference existence before deletion.
 */
export async function validateFoodPreferenceDeletion({
  prisma,
  id,
}: {
  prisma: PrismaService;
  id: string;
}) {
  const existing = await prisma.foodPreference.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    throw new NotFoundException(`Food preference with ID ${id} not found`);
  }
  return existing;
}
