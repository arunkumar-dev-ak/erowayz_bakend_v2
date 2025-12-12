import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { VendorTypeService } from 'src/vendor-type/vendor-type.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import { MetadataService } from 'src/metadata/metadata.service';
import { Prisma, VendorCategoryType } from '@prisma/client';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { GetCategoryQueryDto } from './dto/get-category-query.dto';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly vendorTypeService: VendorTypeService,
    private readonly fileUploadService: FileUploadService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getAllCategory({
    res,
    offset,
    limit,
    query,
  }: {
    res: Response;
    offset: number;
    limit: number;
    query: GetCategoryQueryDto;
  }) {
    const initialDate = new Date();
    const { name, vendorId, vendorTypeId, status } = query;
    const where: Prisma.CategoryWhereInput = {};
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    if (vendorId) {
      where.item = {
        some: {
          vendorId,
        },
      };
    }
    if (vendorTypeId) {
      where.vendorTypeId = vendorTypeId;
    }
    if (status) {
      where.status = status;
    }

    const totalCount = await this.prisma.category.count({ where });

    const categories = await this.prisma.category.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        vendorType: true,
      },
    });

    const queries = buildQueryParams({
      name,
      vendorId,
      vendorTypeId,
      status,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'category/popular',
      queries,
    });

    return this.response.successResponse({
      res,
      data: categories,
      meta,
      message: 'Category retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getCategoryByVendorId({
    res,
    query,
    vendorTypeId,
    offset,
    limit,
  }: {
    res: Response;
    query: GetCategoryQueryDto;
    vendorTypeId: string;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const { name, vendorId } = query;

    const where: Prisma.CategoryWhereInput = {
      vendorTypeId,
    };
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }
    if (vendorId) {
      where.item = {
        some: {
          vendorId,
        },
      };
    }

    const totalCount = await this.prisma.category.count({
      where,
    });
    const categories = await this.prisma.category.findMany({
      where,
      take: limit,
      skip: offset,
    });

    const metadata = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: `category/${vendorTypeId}`,
    });

    return this.response.successResponse({
      res,
      data: categories,
      meta: metadata,
      message: 'Categories retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createCategory({
    res,
    body,
    categoryImage,
  }: {
    res: Response;
    body: CreateCategoryDto;
    categoryImage: Express.Multer.File;
  }) {
    const initialDate = new Date();
    const { name, vendorTypeId, tamilName, status } = body;
    //check vendorTypeId
    const vendorType =
      await this.vendorTypeService.findVendorTypeById(vendorTypeId);
    if (
      !vendorType ||
      vendorType.status == 'INACTIVE' ||
      vendorType.type != VendorCategoryType.PRODUCT
    ) {
      throw new Error(
        'Vendor Type not found or VendorType is not Product Type',
      );
    }
    //check unique name
    if (await this.checkCategoryByName({ name, vendorTypeId })) {
      throw new Error('Category name must be unique');
    }
    //file upload
    const { imageUrl, relativePath } =
      this.fileUploadService.handleSingleFileUpload({
        file: categoryImage,
        body: {
          type: ImageTypeEnum.CATEGORY,
        },
      });

    try {
      const category = await this.prisma.category.create({
        data: {
          name,
          vendorTypeId,
          imageRef: imageUrl,
          relativeUrl: relativePath,
          tamilName,
          status,
        },
      });

      return this.response.successResponse({
        res,
        data: category,
        initialDate,
        message: 'Category created successfully',
        statusCode: 200,
      });
    } catch (err) {
      this.fileUploadService.handleSingleFileDeletion(relativePath);
      throw err;
    }
  }

  async updateCategory({
    res,
    body,
    categoryId,
    categoryImage,
  }: {
    res: Response;
    body: UpdateCategoryDto;
    categoryId: string;
    categoryImage?: Express.Multer.File;
  }) {
    const initialDate = new Date();

    if (
      body === undefined ||
      (!body.name && !categoryImage && !body.tamilName && !body.status)
    ) {
      throw new Error('No valid fields provided for update');
    }

    const { name, tamilName, status } = body;

    const category = await this.checkCategoryById(categoryId);
    //check category
    if (!category) {
      throw new NotFoundException(
        'Category not found or Not associated with vendorType',
      );
    }
    //check unique name
    if (
      name &&
      (await this.checkCategoryByName({
        vendorTypeId: category.vendorTypeId,
        name,
        id: categoryId,
      }))
    ) {
      throw new ConflictException('Category name must be unique');
    }
    //file upload
    const updatedImage = categoryImage
      ? this.fileUploadService.handleSingleFileUpload({
          file: categoryImage,
          body: {
            type: ImageTypeEnum.CATEGORY,
          },
        })
      : undefined;

    const updateQuery = {
      name: name ?? undefined,
      imageRef: updatedImage ? updatedImage.imageUrl : undefined,
      relativeUrl: updatedImage ? updatedImage.relativePath : undefined,
      tamilName: tamilName ?? undefined,
      status: status ?? undefined,
    };

    try {
      const updateCategory = await this.prisma.category.update({
        where: { id: categoryId },
        data: updateQuery,
      });

      if (updatedImage) {
        this.fileUploadService.handleSingleFileDeletion(category.relativeUrl);
      }

      return this.response.successResponse({
        res,
        data: updateCategory,
        initialDate,
        message: 'Category updated successfully',
        statusCode: 200,
      });
    } catch (err) {
      if (updatedImage) {
        this.fileUploadService.handleSingleFileDeletion(
          updatedImage.relativePath,
        );
      }
      throw err;
    }
  }

  async deletCategory({
    res,
    categoryId,
  }: {
    res: Response;
    categoryId: string;
  }) {
    const initialDate = new Date();
    const category = await this.checkCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found ');
    }
    //file deletion
    const deletedFile = await this.prisma.category.delete({
      where: { id: categoryId },
    });
    if (deletedFile.relativeUrl) {
      this.fileUploadService.handleSingleFileDeletion(deletedFile.relativeUrl);
    }

    return this.response.successResponse({
      res,
      data: deletedFile,
      initialDate,
      message: 'Category deleted successfully',
      statusCode: 200,
    });
  }

  async checkCategoryByName({
    vendorTypeId,
    name,
    id,
  }: {
    vendorTypeId: string;
    name: string;
    id?: string;
  }) {
    return await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        vendorTypeId,
        id: id ? { not: id } : undefined,
      },
    });
  }

  async checkCategoryById(categoryId: string) {
    return await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        item: true,
      },
    });
  }

  async findCategoryByVendorType({
    categoryId,
    vendorTypeId,
  }: {
    categoryId: string;
    vendorTypeId: string;
  }) {
    return await this.prisma.category.findUnique({
      where: { id: categoryId, vendorTypeId },
    });
  }
}
