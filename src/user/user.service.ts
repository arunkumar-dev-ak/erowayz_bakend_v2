import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { Response } from 'express';
import { MetadataService } from 'src/metadata/metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { EditUserDto, TrueOrFalseMap } from './dto/edit-user.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageTypeEnum } from 'src/file-upload/dto/file-upload.dto';
import {
  buildBloodDetailsInput,
  buildEditUserUpdateInput,
} from './utils/edit-user.utils';
import { BloodDetailsService } from 'src/blood-details/blood-details.service';
import { buildQueryParams } from 'src/common/functions/buildQueryParams';
import { GetUserQueryDto } from './dto/get-user-query.dto';
import { UserStatusChangeDto } from './dto/user-status-change.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly metaDataService: MetadataService,
    private readonly uploadService: FileUploadService,
    private readonly bloodDetailService: BloodDetailsService,
  ) {}

  async getUsers({
    res,
    offset,
    limit,
    query,
  }: {
    res: Response;
    offset: number;
    limit: number;
    query: GetUserQueryDto;
  }) {
    const initialDate = new Date();
    const { name } = query;
    const where: Prisma.UserWhereInput = {
      role: Role.CUSTOMER,
    };
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    const totalCount = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      include: {
        bloodDetails: true,
      },
      orderBy: {
        status: 'asc',
      },
    });

    const queries = buildQueryParams({
      name,
    });

    const meta = this.metaDataService.createMetaData({
      totalCount,
      offset,
      limit,
      path: 'user/getAll',
      queries,
    });

    return this.response.successResponse({
      res,
      data: users,
      meta,
      message: 'Users retrieved successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async getUserById({ res, userId }: { res: Response; userId: string }) {
    const initialDate = new Date();
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        bloodDetails: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.response.successResponse({
      res,
      data: user,
      initialDate,
      statusCode: 200,
      message: 'User fetched successfully',
    });
  }

  async getUserByMobile({ res, mobile }: { res: Response; mobile: string }) {
    const initialDate = new Date();

    const user = await this.prisma.user.findUnique({
      where: {
        mobile,
      },
    });

    return this.response.successResponse({
      res,
      data: user ?? null,
      message: 'User fetched Successfully',
      initialDate,
      statusCode: 200,
    });
  }

  async updateCustomer({
    userId,
    body,
    res,
    image,
    existingRelativeUrl,
  }: {
    userId: string;
    body: EditUserDto;
    res: Response;
    image?: Express.Multer.File;
    existingRelativeUrl?: string | undefined;
  }) {
    const initialDate = new Date();

    if (body.email) {
      await this.checkUserByEmailForAccount(body.email, userId);
    }

    const existingBloodDetails =
      await this.bloodDetailService.findBloodDetailsByUser(userId);

    const bloodDetailInput = buildBloodDetailsInput({
      body,
      userId,
      existingBloodDetails: !!existingBloodDetails,
    });

    let imageUrl: string | undefined;
    let relativePath: string | undefined;

    if (!image && (!body || Object.values(body).length === 0)) {
      throw new BadRequestException('No valid fields provided to update');
    }

    // File upload if image is provided
    if (image) {
      const uploaded = this.uploadService.handleSingleFileUpload({
        file: image,
        body: { type: ImageTypeEnum.PROFILE },
      });
      imageUrl = uploaded.imageUrl;
      relativePath = uploaded.relativePath;
    }

    const userUpdateData = buildEditUserUpdateInput({
      body,
      imageUrl,
      relativePath,
    });

    try {
      const userUpdate = await this.prisma.$transaction(async (tx) => {
        // 1. Create or update blood details if applicable
        if (bloodDetailInput) {
          if (bloodDetailInput.mode === 'update') {
            await tx.bloodDetails.update({
              where: { userId },
              data: bloodDetailInput.data,
            });
          } else if (bloodDetailInput.mode === 'create') {
            await tx.bloodDetails.create({
              data: bloodDetailInput.data,
            });
          }
        }

        // 2. Update user
        return await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
          include: {
            bloodDetails: true,
          },
        });
      });

      // Delete old image if replaced
      if (imageUrl && existingRelativeUrl) {
        this.uploadService.handleSingleFileDeletion(existingRelativeUrl);
      }

      return this.response.successResponse({
        initialDate,
        res,
        data: userUpdate,
        message: 'User updated successfully',
        statusCode: 200,
      });
    } catch (err) {
      if (relativePath) {
        this.uploadService.handleSingleFileDeletion(relativePath);
      }
      throw err;
    }
  }

  async changeUserStatus({
    res,
    body,
  }: {
    res: Response;
    body: UserStatusChangeDto;
  }) {
    const initialDate = new Date();

    const { status, userId } = body;
    const existingUser = await this.getUserByIdForStatusChange(userId);
    if (!existingUser) {
      throw new BadRequestException('User Not Found');
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: TrueOrFalseMap[status],
      },
    });

    return this.response.successResponse({
      res,
      data: updatedUser,
      message: 'User Updated Successfully',
      initialDate,
      statusCode: 200,
    });
  }

  /*----- hepler func -----*/
  async checkUserByMobile(mobile: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        mobile,
      },
      include: {
        vendor: {
          include: {
            shopInfo: true,
            vendorServiceOption: {
              include: {
                serviceOption: true,
              },
            },
            vendorType: true,
          },
        },
      },
    });
    return user ?? null;
  }

  async fetchUserById(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async checkUserById(userId: string) {
    const currentDate = new Date();

    const activeSubscriptionFilter = {
      isActive: true,
      startDate: {
        lte: currentDate,
      },
      endDate: {
        gte: currentDate,
      },
    };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendor: {
          include: {
            vendorSubscription: {
              where: activeSubscriptionFilter,
            },
          },
        },
        staff: {
          include: {
            vendor: {
              include: {
                vendorSubscription: {
                  where: activeSubscriptionFilter,
                },
              },
            },
          },
        },
      },
    });

    return user ?? null;
  }

  async checkUserByEmailForAccount(email: string, id?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (!id) {
        throw new BadRequestException(
          'The provided email is already associated with an account. Please use a different email.',
        );
      }

      if (user.id !== id) {
        throw new BadRequestException(
          'The provided email is already used by another account. Please use a different email.',
        );
      }
    }

    return user;
  }

  async getUserByIdForStatusChange(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }
}
