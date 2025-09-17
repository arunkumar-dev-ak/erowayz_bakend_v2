import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTokenPair({
    userId,
    tx,
    salt,
  }: {
    userId: string;
    salt: string;
    tx: Prisma.TransactionClient;
  }) {
    const accessToken = this.generateAccessToken({ userId, salt });
    const refreshToken = await this.generateRefreshToken({ userId, tx, salt });
    return { accessToken, refreshToken };
  }

  generateAccessToken({ userId, salt }: { userId: string; salt: string }) {
    const secret =
      (process.env.ACCESS_TOKEN_SECRET || 'AccessTokenSecret') + salt;
    return this.jwtService.sign(
      { sub: userId, uuid: uuidv4() },
      {
        secret,
        expiresIn: process.env.ACCESS_TOKEN_VALIDITY || '1d',
      },
    );
  }

  async generateRefreshToken({
    userId,
    tx,
    salt,
  }: {
    userId: string;
    tx: Prisma.TransactionClient;
    salt: string;
  }) {
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_VALIDITY || '30d';
    const expiresInSeconds = this.getSecondsFromTtl(refreshTokenExpiresIn);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    const maxRefreshTokens = parseInt(process.env.REFRESH_TOKEN_LIMIT || '10');
    const secret =
      (process.env.REFRESH_TOKEN_SECRET || 'RefreshTokenSecret') + salt;
    const refreshToken = this.jwtService.sign(
      { sub: userId, uuid: uuidv4() },
      {
        secret,
        expiresIn: refreshTokenExpiresIn,
      },
    );

    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    const refreshTokenCount = await tx.refreshToken.count({
      where: { userId },
    });

    if (refreshTokenCount > maxRefreshTokens) {
      const oldestRefreshToken = await tx.refreshToken.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (oldestRefreshToken) {
        await tx.refreshToken.delete({
          where: { id: oldestRefreshToken.id },
        });
      }
    }

    return refreshToken;
  }

  private getSecondsFromTtl(ttl: string | number): number {
    if (typeof ttl === 'number') return ttl;

    const matches = String(ttl).match(/^(\d+)([hmsd])$/);
    if (matches) {
      const value = parseInt(matches[1], 10);
      const unit = matches[2];
      switch (unit) {
        case 'h':
          return value * 60 * 60;
        case 'm':
          return value * 60;
        case 's':
          return value;
        case 'd':
          return value * 24 * 60 * 60;
      }
    }
    return parseInt(ttl, 10);
  }

  async verifyAccessToken({ token, salt }: { token: string; salt: string }) {
    const secret =
      (process.env.ACCESS_TOKEN_SECRET || 'AccessTokenSecret') + salt;
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
    } catch {
      return null;
    }
  }

  decodeJwtToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }

  async verifyRefreshToken({ token, salt }: { token: string; salt: string }) {
    const secret =
      (process.env.REFRESH_TOKEN_SECRET || 'RefreshTokenSecret') + salt;
    try {
      // Verify token signature
      await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      // Check if token exists in DB
      const session = await this.prisma.refreshToken.findUnique({
        where: { token },
      });

      if (!session) return null;

      // Check if the refresh token is expired
      if (session.expiresAt < new Date()) return null;

      return session;
    } catch {
      return null;
    }
  }

  async revokeRefreshToken({
    token,
    tx,
  }: {
    token: string;
    tx: Prisma.TransactionClient;
  }) {
    try {
      const refreshToken = await tx.refreshToken.delete({
        where: { token },
      });
      return refreshToken;
    } catch {
      return null;
    }
  }
  async revokeAllUserRefreshTokens({
    userId,
    tx,
  }: {
    userId: string;
    tx: Prisma.TransactionClient;
  }) {
    await tx.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
