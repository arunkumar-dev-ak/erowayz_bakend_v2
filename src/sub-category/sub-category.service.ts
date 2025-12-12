import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CategoryService } from 'src/category/category.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { MetadataService } from 'src/metadata/metadata.service';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { GetSubCategoryQueryDto } from './dto/get-sub-category-query.dto';
import { Prisma } from '@prisma/client';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class SubCategoryService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly uploadService: FileUploadService,
    private readonly metadataService: MetadataService,
  ) {}

  async getAllSubCategory({
    res,
    offset,
    limit,
    query,
  }: {
    res: Response;
    offset: number;
    limit: number;
    query: GetSubCategoryQueryDto;
  }) {
    const initialDate = new Date();
    const { name, status } = query;
    const where: Prisma.SubCategoryWhereInput = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    if (status) {
      where.status = status;
    }

    const totalCount = await this.prisma.subCategory.count({ where });

    const categories = await this.prisma.subCategory.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        category: true,
      },
    });

    const queries = buildQueryParams({
      name,
      status,
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'sub-category/getAll/admin',
      queries,
    });

    return this.response.successResponse({
      res,
      data: categories,
      meta,
      message: 'Sub Category retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getSubCategoryByCategory({
    res,
    categoryId,
    offset,
    limit,
  }: {
    res: Response;
    categoryId: string;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();
    //check category
    const category = await this.categoryService.checkCategoryById(categoryId);
    if (!category || category.status == 'INACTIVE') {
      throw new NotFoundException('Category not found');
    }
    const totalCount = await this.prisma.subCategory.count({
      where: {
        categoryId,
      },
    });
    const subCategories = await this.prisma.subCategory.findMany({
      where: {
        categoryId,
      },
      take: limit,
      skip: offset,
    });

    const meta = this.metadataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `subcategory/${categoryId}`,
    });

    return this.response.successResponse({
      initialDate,
      res,
      data: subCategories,
      meta,
      message: 'Subcategories retrieved successfully',
      statusCode: 200,
    });
  }

  async createSubCategory({
    res,
    body,
    subCategoryImage,
  }: {
    res: Response;
    body: CreateSubCategoryDto;
    subCategoryImage: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const { name, categoryId, tamilName, status } = body;
    const category = await this.categoryService.checkCategoryById(categoryId);

    //check category
    if (!category || category.status == 'INACTIVE') {
      throw new NotFoundException('Category not found');
    }
    //check unique name
    if (await this.getSubCategoryByNameAndCategory({ name, categoryId })) {
      throw new Error('Subcategory name must be unique');
    }
    //file upload
    const { imageUrl, relativePath } =
      this.uploadService.handleSingleFileUpload({
        file: subCategoryImage,
        body: { type: ImageTypeEnum.SUBCATEGORY },
      });

    try {
      const result = await this.prisma.subCategory.create({
        data: {
          name,
          categoryId,
          imageRef: imageUrl,
          relativeUrl: relativePath,
          tamilName,
          status,
        },
      });

      return this.response.successResponse({
        res,
        data: result,
        message: 'Subcategory created successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      this.uploadService.handleSingleFileDeletion(relativePath);
      throw err;
    }
  }

  async updateSubCategory({
    res,
    body,
    subCategoryId,
    subCategoryImage,
  }: {
    res: Response;
    body: UpdateSubCategoryDto;
    subCategoryId: string;
    subCategoryImage?: Express.Multer.File;
  }) {
    const initialDate = new Date();
    if (body == undefined && !subCategoryImage) {
      throw new ConflictException('No valid fields provided for update');
    }

    const { name, tamilName, status } = body;
    //check subCategory
    const subCategory = await this.getSubCategoryId(subCategoryId);
    if (!subCategory) {
      throw new NotFoundException('Subcategory not found');
    }
    //check uniqueness name
    if (
      name &&
      (await this.getSubCategoryByNameAndCategory({
        name,
        categoryId: subCategory.categoryId,
        id: subCategoryId,
      }))
    ) {
      throw new Error('Subcategory name must be unique');
    }

    //file upload
    const updatedImage = subCategoryImage
      ? this.uploadService.handleSingleFileUpload({
          file: subCategoryImage,
          body: { type: ImageTypeEnum.SUBCATEGORY },
        })
      : undefined;

    const updateQuery = {
      name: name ?? undefined,
      tamilName: tamilName ?? undefined,
      status: status ?? undefined,
      imageRef: updatedImage?.imageUrl ?? undefined,
      relativeUrl: updatedImage?.relativePath ?? undefined,
    };
    try {
      const result = await this.prisma.subCategory.update({
        where: {
          id: subCategoryId,
        },
        data: updateQuery,
      });

      if (updatedImage) {
        this.uploadService.handleSingleFileDeletion(subCategory.relativeUrl);
      }

      return this.response.successResponse({
        res,
        data: result,
        message: 'Subcategory updated successfully',
        statusCode: 200,
        initialDate,
      });
    } catch (err) {
      if (updatedImage) {
        this.uploadService.handleSingleFileDeletion(updatedImage.relativePath);
      }
      throw err;
    }
  }

  async deleteSubCategory({
    res,
    subCategoryId,
  }: {
    res: Response;
    subCategoryId: string;
  }) {
    const initialDate = new Date();
    //check subCategory
    const subCategory = await this.getSubCategoryId(subCategoryId);
    if (!subCategory) {
      throw new NotFoundException('Subcategory not found');
    }
    //if item prevent from deletion
    if (subCategory.item.length > 0) {
      throw new ForbiddenException(
        'Subcategory cannot be deleted due to item association',
      );
    }
    const deletedSubCategory = await this.prisma.subCategory.delete({
      where: {
        id: subCategoryId,
      },
    });

    this.uploadService.handleSingleFileDeletion(subCategory.relativeUrl);

    return this.response.successResponse({
      res,
      data: deletedSubCategory,
      message: 'Subcategory deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getSubCategoryId(subCategoryId: string) {
    const subCategory = await this.prisma.subCategory.findFirst({
      where: {
        id: subCategoryId,
      },
      include: {
        item: true,
      },
    });
    return subCategory;
  }

  async getSubCategoryByNameAndCategory({
    name,
    categoryId,
    id,
  }: {
    name: string;
    categoryId: string;
    id?: string;
  }) {
    return await this.prisma.subCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        categoryId,
        id: id ? { not: id } : undefined,
      },
    });
  }

  async getSubCategoryByIdAndCategory({
    subCategoryId,
    categoryId,
  }: {
    subCategoryId: string;
    categoryId: string;
  }) {
    const subCategory = await this.prisma.subCategory.findFirst({
      where: {
        id: subCategoryId,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return subCategory;
  }
}
