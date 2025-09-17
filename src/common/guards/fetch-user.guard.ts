import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtPayload, TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { SocketRequest } from './auth.guard';
import { Request } from 'express';

@Injectable()
export class FetchUserGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isWebSocket = context.getType() === 'ws';
    let token: string | undefined;

    if (isWebSocket) {
      const client: Socket = context.switchToWs().getClient();
      const authHeader = client.handshake.headers.authorization;
      token = this.extractTokenFromHeader(authHeader);
    } else {
      const request: Request = context.switchToHttp().getRequest();
      token = this.extractTokenFromHeader(request.headers.authorization);
    }

    if (!token) {
      return true;
    }

    // Decode token
    const decodedToken: JwtPayload | null =
      this.tokenService.decodeJwtToken(token);
    if (!decodedToken) {
      return true;
    }

    const user = await this.userService.checkUserById(decodedToken.sub);
    if (!user || user.status === false) {
      return true;
    }

    const payload = await this.tokenService.verifyAccessToken({
      token,
      salt: user.salt,
    });

    if (!payload) {
      return true;
    }

    // Attach user to context (request or socket)
    if (isWebSocket) {
      const client = context.switchToWs().getClient<SocketRequest>();
      client.user = user; // Socket.IO way
    } else {
      const request: Request = context.switchToHttp().getRequest();
      request['user'] = user;
    }

    return true;
  }

  private extractTokenFromHeader(header?: string): string | undefined {
    const [type, token] = header?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
