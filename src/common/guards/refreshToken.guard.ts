import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { Request } from 'express';
import { RefreshTokenDto } from 'src/auth/dto/logout.dto';
import { JwtPayload, TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const body: RefreshTokenDto | null = request.body as RefreshTokenDto | null;
    if (!body || !body.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const refreshToken: string = body.refreshToken;
    /*----- verify refresh token -----*/
    const decodedToken: JwtPayload | null =
      this.tokenService.decodeJwtToken(refreshToken);

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    /*----- check user and store in request -----*/
    const user = await this.userService.checkUserById(decodedToken.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    /*----- Verify Token -----*/
    const payload: RefreshToken | null =
      await this.tokenService.verifyRefreshToken({
        token: refreshToken,
        salt: user.salt,
      });

    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    /*----- Assign user to request -----*/
    request['user'] = user;
    return true;
  }
}
