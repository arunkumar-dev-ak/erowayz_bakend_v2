import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { TokenService } from 'src/token/token.service';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';
import { CreateSubAdminDto } from './dto/create-sub-admin.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { UpdateSubAdminDto } from './dto/update-sub-admin.dto';
import { v4 as uuidv4 } from 'uuid';
import { LoginSubAdminDto } from './dto/login-sub-admin.dto';
import { LogoutSubAdminDto } from './dto/logout-sub-admin.dto';

@Injectable()
export class SubAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly tokenService: TokenService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {}

  async getAllSubAdminByVendorId({ res }: { res: Response }) {
    const initialDate = new Date();
    const subAdmin = await this.prisma.user.findMany({
      where: {
        role: 'SUB_ADMIN',
      },
    });
    return this.response.successResponse({
      res,
      data: subAdmin,
      message: 'SubAdmin fetched successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createSubAdminAccount({
    res,
    body,
  }: {
    res: Response;
    body: CreateSubAdminDto;
  }) {
    const initialDate = new Date();
    const { email, password, name, status } = body;
    if (await this.findSubAdminByName(email)) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.SUB_ADMIN,
        status,
      },
    });
    return this.response.successResponse({
      res,
      data: result,
      message: 'SubAdmin created successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateSubAdminAccount({
    id,
    res,
    body,
  }: {
    id: string;
    res: Response;
    body: UpdateSubAdminDto;
  }) {
    const initialDate = new Date();
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }
    const { email, password, status } = body;
    const existingSubAdmin = await this.findSubAdminById(id);
    if (!existingSubAdmin) {
      throw new ForbiddenException('SubAdmin not found');
    }
    if (email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email, id: { not: id } },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    if (password) {
      body.password = await bcrypt.hash(password, 10);
    }
    // Set a new salt if username or password is changed
    if (password || email || status !== existingSubAdmin.status) {
      body['salt'] = uuidv4();
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedSubAdmin = await this.prisma.user.update({
        where: { id },
        data: body,
      });
      if (body['salt'] !== undefined) {
        await this.logoutSubAdminAccountBySubAdminId({
          subAdminId: updatedSubAdmin.id,
          tx,
        });
      }
      return updatedSubAdmin;
    });

    return this.response.successResponse({
      res,
      data: result,
      message: 'SubAdminInfo updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteSubAdminAccount({
    res,
    subAdminId,
    vendorId,
  }: {
    res: Response;
    subAdminId: string;
    vendorId: string;
  }) {
    const initialDate = new Date();
    const existingSubAdmin = await this.findSubAdminById(vendorId);
    if (!existingSubAdmin) {
      throw new ForbiddenException('SubAdmin not found');
    }
    const result = await this.prisma.user.delete({
      where: { id: subAdminId },
    });
    return this.response.successResponse({
      res,
      data: result,
      message: 'SubAdminInfo deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async loginSubAdminAccount({
    res,
    body,
  }: {
    res: Response;
    body: LoginSubAdminDto;
  }) {
    const initialDate = new Date();
    const { email, password } = body;
    const existingUser = await this.findSubAdminByEmail(email);
    if (!existingUser) {
      throw new BadRequestException('Invalid Username');
    }
    const isMatch =
      typeof existingUser.password === 'string'
        ? await bcrypt.compare(password, existingUser.password)
        : null;
    if (!isMatch) {
      throw new BadRequestException('Invalid Password');
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const { accessToken, refreshToken } =
        await this.tokenService.generateTokenPair({
          userId: existingUser.id,
          tx,
          salt: existingUser.salt,
        });
      return { accessToken, refreshToken };
    });

    return this.response.successResponse({
      res,
      data: { ...existingUser, ...result },
      message: 'SubAdmin Login successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- SubAdmin logouts on individual device -----*/
  async logout({ body, res }: { body: LogoutSubAdminDto; res: Response }) {
    const initialDate = new Date();
    const { refreshToken } = body;
    await this.prisma.$transaction(async (tx) => {
      await this.tokenService.revokeRefreshToken({
        token: refreshToken,
        tx,
      });
    });
    return this.response.successResponse({
      res,
      data: {},
      message: 'SubAdmin logged out successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- subAdmin logouts subAdmin account on all devices -----*/
  async logoutSubAdminAccountOnAllDevice({
    subAdminId,
    res,
  }: {
    subAdminId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    await this.prisma.$transaction(async (tx) => {
      await this.logoutSubAdminAccountBySubAdminId({ tx, subAdminId });
    });

    return this.response.successResponse({
      res,
      data: {},
      message: 'SubAdmin logged out on all device successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- vendor logouts subAdmin account -----*/
  async logoutSubAdminAccountByVendor({
    subAdminId,
    res,
  }: {
    subAdminId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const existingSubAdmin = await this.findSubAdminById(subAdminId);
    if (!existingSubAdmin) {
      throw new ForbiddenException('SubAdmin not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.logoutSubAdminAccountBySubAdminId({ tx, subAdminId });
    });

    return this.response.successResponse({
      res,
      data: {},
      message: 'SubAdmin logged out on all device successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async logoutSubAdminAccountBySubAdminId({
    subAdminId,
    tx,
  }: {
    subAdminId: string;
    tx: Prisma.TransactionClient;
  }) {
    await tx.user.update({
      where: { id: subAdminId },
      data: {
        salt: uuidv4(),
      },
    });
    await this.tokenService.revokeAllUserRefreshTokens({
      userId: subAdminId,
      tx,
    });
  }

  async findSubAdminByName(email: string, id?: string) {
    const subAdmin = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        id: id ? { not: id } : undefined,
      },
    });
    return subAdmin;
  }

  async findSubAdminById(id: string) {
    const subAdmin = await this.prisma.user.findUnique({
      where: { id },
    });

    return subAdmin;
  }

  async findSubAdminByEmail(email: string) {
    const subAdmin = await this.prisma.user.findUnique({
      where: {
        email,
        role: Role.STAFF,
      },
    });
    return subAdmin;
  }
}
