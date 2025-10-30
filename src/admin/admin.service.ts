import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseService } from 'src/response/response.service';
import { AdminLoginDto } from './dto/adminlogin.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AdminLogoutDto } from './dto/adminlogout.dto';
import { TokenService } from 'src/token/token.service';
import { Role } from '@prisma/client';
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly response: ResponseService,
    private readonly tokenService: TokenService,
  ) {}
  // pwd: 12345678

  async loginAdmin({ res, body }: { res: Response; body: AdminLoginDto }) {
    const initialDate = new Date();
    const { email, password } = body;
    const admin = await this.findAdminByEmail(email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!admin.status) {
      throw new BadRequestException(
        'Your account is Inactive.Ask the Admin to Active',
      );
    }

    const isMatch =
      typeof admin.password === 'string'
        ? await bcrypt.compare(password, admin.password)
        : null;

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { salt, id } = admin;
    const result = await this.prisma.$transaction(async (tx) => {
      const { accessToken, refreshToken } =
        await this.tokenService.generateTokenPair({
          userId: id,
          tx,
          salt,
        });
      return { accessToken, refreshToken };
    });
    return this.response.successResponse({
      res,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email!,
        role: admin.role,
        status: admin.status,
        ...result,
      },
      message: 'Admin Login successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async logout({ res, body }: { res: Response; body: AdminLogoutDto }) {
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
      message: 'Admin Logged out successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async logoutOnAllDevive({
    adminId,
    res,
  }: {
    adminId: string;
    res: Response;
  }) {
    const initialDate = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: adminId },
        data: {
          salt: uuidv4(),
        },
      });
      await this.tokenService.revokeAllUserRefreshTokens({
        userId: adminId,
        tx,
      });
    });
    return this.response.successResponse({
      res,
      data: {},
      message: 'Admin logged out on all device successfully',
      statusCode: 200,
      initialDate,
    });
  }

  async findAdminByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: {
          in: [Role.ADMIN, Role.SUB_ADMIN], // this filters role in array
        },
      },
    });
    return user;
  }

  async findAdminById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id, role: Role.ADMIN },
    });
  }
}
