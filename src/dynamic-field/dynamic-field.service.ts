import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CreateDynamicFieldDto } from './dto/create-dynamic-field.dto';
import { DynamicContext, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { UpdateDynamicFieldDto } from './dto/update-dynamic-field.dto copy';
import { updateDynamicFieldVerification } from './utils/update-dyn-field.utils';
import { ChangeDynamicFieldStatusDto } from './dto/change-dynamic-field-status.dto copy 2';
import { GetDynamicFieldQueryDto } from './dto/get-dynamic-field-query.dto';
import { buildDynamicFieldWhereFilter } from './utils/get-dynamicfield.utils';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { TrueOrFalseMap } from 'src/user/dto/edit-user.dto';

@Injectable()
export class DynamicFieldService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly responseService: ResponseService,
    private readonly metaDataService: MetadataService,
  ) {}

  async getDynamicField({
    res,
    query,
    offset,
    limit,
  }: {
    res: Response;
    query: GetDynamicFieldQueryDto;
    offset: number;
    limit: number;
  }) {
    const initialDate = new Date();

    const where = buildDynamicFieldWhereFilter({
      query,
    });

    const totalCount = await this.prisma.dynamicField.count({ where });

    const keyWords = await this.prisma.dynamicField.findMany({
      where,
      skip: offset,
      take: limit,
    });

    const queries = buildQueryParams({
      id: query.id,
      label: query.label,
      context: query.context,
      status: query.status,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'dynamic-field',
      queries,
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: keyWords,
      meta,
      message: 'keyWords retrieved successfully',
      statusCode: 200,
    });
  }

  async createDynamicField({
    res,
    body,
  }: {
    res: Response;
    body: CreateDynamicFieldDto;
  }) {
    const initialDate = new Date();

    const {
      label,
      pattern,
      errorMessage,
      type,
      isRequired,
      context,
      status,
      selectOptions,
    } = body;

    if (await this.getDynamicFieldByContextAndLabel({ label, context })) {
      throw new BadRequestException(
        `${label} is already present for the ${context}`,
      );
    }

    const createData: Prisma.DynamicFieldCreateInput = {
      label,
      pattern,
      errorMessage,
      type,
      isRequired: TrueOrFalseMap[isRequired],
      context,
      status,
    };

    // Conditionally add selectOptions if present and non-empty
    if (selectOptions && selectOptions.length > 0) {
      createData.selectOptions = {
        createMany: {
          data: selectOptions.map((val) => ({
            value: val,
            label: val, // Use same string for label and value
          })),
        },
      };
    }

    const dynamicField = await this.prisma.dynamicField.create({
      data: createData,
    });

    return this.responseService.successResponse({
      statusCode: 200,
      data: dynamicField,
      initialDate,
      message: 'Dynamic Field created successfully',
      res,
    });
  }

  async updateDynamicField({
    res,
    body,
    dynFieldId,
  }: {
    res: Response;
    body: UpdateDynamicFieldDto;
    dynFieldId: string;
  }) {
    const initialDate = new Date();

    const {
      label,
      pattern,
      errorMessage,
      type,
      isRequired,
      status,
      selectOptions,
    } = body;

    //verification
    const { dynamicField, shouldDeleteSelectOptions } =
      await updateDynamicFieldVerification({
        body,
        dynFieldId,
        dynamicFieldService: this,
      });

    const updateDynamicField = await this.prisma.$transaction(async (tx) => {
      //delete prev options
      if (shouldDeleteSelectOptions) {
        await tx.dynamicSelectOption.deleteMany({
          where: {
            fieldId: dynamicField.id,
          },
        });
      }
      //create new options
      if (selectOptions && selectOptions.length > 0) {
        await tx.dynamicSelectOption.createMany({
          data: selectOptions.map((val) => ({
            fieldId: dynamicField.id,
            value: val,
            label: val,
          })),
        });
      }
      //update
      return await tx.dynamicField.update({
        where: {
          id: dynamicField.id,
        },
        data: {
          ...(label !== undefined && { label }),
          ...(pattern !== undefined && { pattern }),
          ...(errorMessage !== undefined && { errorMessage }),
          ...(type !== undefined && { type }),
          ...(isRequired !== undefined && {
            isRequired: TrueOrFalseMap[isRequired],
          }),
          ...(status !== undefined && { status }),
        },
        include: {
          selectOptions: true,
        },
      });
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updateDynamicField,
      message: 'Dynamic Field Updated successfully',
      statusCode: 200,
    });
  }

  async changeDynamicFieldStatus({
    res,
    body,
    dynFieldId,
  }: {
    res: Response;
    body: ChangeDynamicFieldStatusDto;
    dynFieldId: string;
  }) {
    const initialDate = new Date();

    const { status } = body;

    if (!(await this.getDynamicFieldById(dynFieldId))) {
      throw new BadRequestException('Dynamic field not found');
    }

    const updatedDynamicField = await this.prisma.dynamicField.update({
      where: {
        id: dynFieldId,
      },
      data: {
        status,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: updatedDynamicField,
      message: `Status change to ${status} successfully`,
      statusCode: 200,
    });
  }

  async deleteDynamicField({
    res,
    dynFieldId,
  }: {
    res: Response;
    dynFieldId: string;
  }) {
    const initialDate = new Date();

    if (!(await this.getDynamicFieldById(dynFieldId))) {
      throw new BadRequestException('Dynamic field not found');
    }

    const deletedDynamicField = await this.prisma.dynamicField.delete({
      where: {
        id: dynFieldId,
      },
    });

    return this.responseService.successResponse({
      initialDate,
      res,
      data: deletedDynamicField,
      message: 'Dynamic Field deleted successfully',
      statusCode: 200,
    });
  }

  /*----- helper func -----*/
  async getDynamicFieldById(id: string) {
    return await this.prisma.dynamicField.findUnique({
      where: {
        id,
      },
    });
  }

  async getDynamicFieldByContextAndLabel({
    label,
    context,
  }: {
    label: string;
    context: DynamicContext;
  }) {
    return await this.prisma.dynamicField.findUnique({
      where: {
        label_context: {
          label,
          context,
        },
      },
    });
  }
}
