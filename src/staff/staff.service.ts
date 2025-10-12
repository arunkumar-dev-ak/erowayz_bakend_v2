import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDto } from './dto/createstaff.dto';
import { ResponseService } from 'src/response/response.service';
import { UpdateStaffDto } from './dto/updatestaff.dto';
import { LoginStaffDto } from './dto/loginstaff.dto';
import { LogoutStaffDto } from './dto/logoutstaff.dto';
import { v4 as uuidv4 } from 'uuid';
import { Prisma, Role, VendorSubscription } from '@prisma/client';
import { TokenService } from 'src/token/token.service';
import { Response } from 'express';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly tokenService: TokenService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
  ) {}

  async getAllStaffByVendorId({
    res,
    vendorId,
  }: {
    res: Response;
    vendorId: string;
  }) {
    const initialDate = new Date();
    const staff = await this.prisma.staff.findMany({
      where: {
        vendorId,
      },
      include: {
        vendor: true,
        user: true,
      },
    });
    return this.response.successResponse({
      res,
      data: staff,
      message: 'Staff fetched successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async createStaffAccount({
    vendorId,
    res,
    body,
    currentVendorSubscription,
  }: {
    vendorId: string;
    res: Response;
    body: CreateStaffDto;
    currentVendorSubscription: VendorSubscription;
  }) {
    const initialDate = new Date();
    const { email, password, name, status } = body;
    if (await this.findStaffByName(email)) {
      throw new ConflictException('Username already exists');
    }

    const staffAccountLimit = (
      currentVendorSubscription.planFeatures as Record<string, any>
    )['staffAccountLimit'] as number | null;
    if (!staffAccountLimit) {
      throw new BadRequestException(
        'You are not allowed to create a Staff account',
      );
    }

    const currentStaffAccountCount = await this.prisma.staff.count({
      where: {
        vendorId,
      },
    });
    if (currentStaffAccountCount >= staffAccountLimit) {
      throw new BadRequestException(
        `You can able to create only ${staffAccountLimit} staff accounts`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STAFF,
        status,
        staff: {
          create: {
            vendorId,
          },
        },
      },
    });
    return this.response.successResponse({
      res,
      data: result,
      message: 'Staff created successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async updateStaffAccount({
    vendorId,
    id,
    res,
    body,
  }: {
    vendorId: string;
    id: string;
    res: Response;
    body: UpdateStaffDto;
  }) {
    const initialDate = new Date();
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }
    const { email, password, status } = body;
    const existingStaff = await this.findStaffByVendorId({
      vendorId,
      staffId: id,
    });
    if (!existingStaff) {
      throw new ForbiddenException(
        'Vendor is not associated with this staff or staff not found',
      );
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
    if (password || email || status !== existingStaff.user['status']) {
      body['salt'] = uuidv4();
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedStaff = await this.prisma.user.update({
        where: { id },
        data: body,
      });
      if (body['salt'] !== undefined) {
        await this.logoutStaffAccountByStaffId({
          staffId: updatedStaff.id,
          tx,
        });
      }
      return updatedStaff;
    });

    return this.response.successResponse({
      res,
      data: result,
      message: 'StaffInfo updated successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async deleteStaffAccount({
    res,
    staffId,
    vendorId,
  }: {
    res: Response;
    staffId: string;
    vendorId: string;
  }) {
    const initialDate = new Date();
    const existingStaff = await this.findStaffByVendorId({
      vendorId,
      staffId,
    });
    if (!existingStaff) {
      throw new ForbiddenException(
        'Vendor is not associated with this staff or staff not found',
      );
    }
    const result = await this.prisma.staff.delete({
      where: { id: staffId },
    });
    return this.response.successResponse({
      res,
      data: result,
      message: 'StaffInfo deleted successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async loginStaffAccount({
    res,
    body,
  }: {
    res: Response;
    body: LoginStaffDto;
  }) {
    const initialDate = new Date();
    const { email, password } = body;
    const existingUser = await this.findStaffByEmail(email);
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
      message: 'Staff Login successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- Staff logouts on individual device -----*/
  async logout({ body, res }: { body: LogoutStaffDto; res: Response }) {
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
      message: 'Staff logged out successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- staff logouts staff account on all devices -----*/
  async logoutStaffAccountOnAllDevice({
    staffId,
    res,
  }: {
    staffId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    await this.prisma.$transaction(async (tx) => {
      await this.logoutStaffAccountByStaffId({ tx, staffId });
    });

    return this.response.successResponse({
      res,
      data: {},
      message: 'Staff logged out on all device successfully',
      statusCode: 200,
      initialDate,
    });
  }

  /*----- vendor logouts staff account -----*/
  async logoutStaffAccountByVendor({
    vendorId,
    staffId,
    res,
  }: {
    vendorId: string;
    staffId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    const existingStaff = await this.findStaffByVendorId({
      vendorId,
      staffId,
    });
    if (!existingStaff) {
      throw new ForbiddenException(
        'Vendor is not associated with this staff or staff not found',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await this.logoutStaffAccountByStaffId({ tx, staffId });
    });

    return this.response.successResponse({
      res,
      data: {},
      message: 'Staff logged out on all device successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async logoutStaffAccountByStaffId({
    staffId,
    tx,
  }: {
    staffId: string;
    tx: Prisma.TransactionClient;
  }) {
    await tx.user.update({
      where: { id: staffId },
      data: {
        salt: uuidv4(),
      },
    });
    await this.tokenService.revokeAllUserRefreshTokens({
      userId: staffId,
      tx,
    });
  }

  async findStaffByName(email: string, id?: string) {
    const staff = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        id: id ? { not: id } : undefined,
      },
    });
    return staff;
  }

  async findStaffById(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    return staff;
  }

  async findStaffByVendorId({
    vendorId,
    staffId,
  }: {
    vendorId: string;
    staffId: string;
  }) {
    const staff = await this.prisma.staff.findFirst({
      where: { vendorId, id: staffId },
      include: { vendor: true, user: true },
    });
    return staff;
  }

  async findStaffByEmail(email: string) {
    const staff = await this.prisma.user.findUnique({
      where: {
        email,
        role: Role.STAFF,
      },
    });
    return staff;
  }
}
