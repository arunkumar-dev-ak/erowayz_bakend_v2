// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { WsException } from '@nestjs/websockets';
// import { Request } from 'express';
// import { JwtPayload, TokenService } from 'src/token/token.service';
// import { UserService } from 'src/user/user.service';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private readonly tokenService: TokenService,
//     private readonly userService: UserService,
//   ) {}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request: Request = context.switchToHttp().getRequest();
//     const token = this.extractTokenFromHeader(request);
//     const isWebSocket = context.getType() === 'ws';

//     if (!token) {
//       if (isWebSocket) {
//         throw new WsException('No token provided');
//       }
//       throw new UnauthorizedException('No token provided');
//     }

//     /*----- decode token -----*/
//     const decodedToken: JwtPayload | null =
//       this.tokenService.decodeJwtToken(token);
//     if (!decodedToken) {
//       if (isWebSocket) {
//         throw new WsException('Invalid token');
//       }
//       throw new UnauthorizedException('Invalid token');
//     }

//     /*----- check user and store in request -----*/
//     const user = await this.userService.checkUserById(decodedToken.sub);
//     if (!user || user.status === false) {
//       if (isWebSocket) {
//         throw new WsException('User not found');
//       }
//       throw new UnauthorizedException('User not found');
//     }

//     /*----- verify token -----*/
//     const payload: JwtPayload | null =
//       await this.tokenService.verifyAccessToken({ token, salt: user.salt });
//     if (!payload) {
//       if (isWebSocket) {
//         throw new WsException('Invalid Token');
//       }
//       throw new UnauthorizedException('Invalid token');
//     }

//     /*----- Assign user to request -----*/
//     request['user'] = user;
//     return true;
//   }

//   private extractTokenFromHeader(req: Request): string | undefined {
//     const [type, token] = req.headers.authorization?.split(' ') ?? [];
//     return type === 'Bearer' ? token : undefined;
//   }
// }

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtPayload, TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { Socket } from 'socket.io';
import { Request } from 'express';
import { User, VendorSubscription } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { VendorSubscriptionService } from 'src/vendor-subscription/vendor-subscription.service';

export interface SocketRequest extends Socket {
  user?: User | null;
  currentSubscription?: VendorSubscription;
}

interface payloadType {
  sub: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly vendorSubscriptionService: VendorSubscriptionService,
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
      const err = 'Login Your Account';
      throw isWebSocket ? new WsException(err) : new UnauthorizedException(err);
    }

    // Decode token
    const decodedToken: JwtPayload | null =
      this.tokenService.decodeJwtToken(token);
    if (!decodedToken) {
      const err = 'Invalid token';
      throw isWebSocket ? new WsException(err) : new UnauthorizedException(err);
    }

    const user = await this.userService.checkUserById(decodedToken.sub);
    if (!user || user.status === false) {
      const err = 'User not found or inactive';
      throw isWebSocket ? new WsException(err) : new UnauthorizedException(err);
    }

    let subscription: VendorSubscription | undefined = undefined;
    if (user.role === 'VENDOR' && user.vendor) {
      subscription =
        (await this.vendorSubscriptionService.checkCurrentVendorSubscription({
          vendorId: user.vendor.id,
        })) ?? undefined;
    } else if (user.role === 'STAFF' && user.staff) {
      subscription =
        (await this.vendorSubscriptionService.checkCurrentVendorSubscription({
          vendorId: user.staff.vendorId,
        })) ?? undefined;
    }

    const payload = await this.tokenService.verifyAccessToken({
      token,
      salt: user.salt,
    });

    if (!payload) {
      const err = 'Invalid or expired token';
      throw isWebSocket ? new WsException(err) : new UnauthorizedException(err);
    }

    // Attach user to context (request or socket)
    if (isWebSocket) {
      const client = context.switchToWs().getClient<SocketRequest>();
      client.user = user; // Socket.IO way
      client.currentSubscription = subscription;
    } else {
      const request: Request = context.switchToHttp().getRequest();
      request['user'] = user;
      request['currentSubscription'] = subscription;
    }

    return true;
  }

  private extractTokenFromHeader(header?: string): string | undefined {
    const [type, token] = header?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  static extractTokenFromSocket(socket: Socket): string | undefined {
    const headerToken = socket.handshake.headers.authorization;
    const [type, token] = headerToken?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  //For socket
  static async validateToken(socket: Socket, jwtService: JwtService) {
    const token = this.extractTokenFromSocket(socket);

    if (!token) {
      return null;
    }

    try {
      const payload: payloadType = await jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET',
      });
      return payload.sub; // Return the user ID
    } catch {
      console.error('in Catch block returning null');
      return null;
    }
  }
}
