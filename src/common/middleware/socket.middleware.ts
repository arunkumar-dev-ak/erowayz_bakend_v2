import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

interface SocketRequest extends Socket {
  user?: string | null;
}
const jwtService = new JwtService(); // You might need to inject this properly if using NestJS DI

export const SocketMiddleware = (
  socket: SocketRequest,
  next: (err?: Error) => void,
) => {
  AuthGuard.validateToken(socket, jwtService)
    .then((user) => {
      if (!user) {
        return next(new UnauthorizedException('Unauthorized'));
      }

      socket.user = user;
      next();
    })
    .catch((error) => {
      console.error('Socket auth error:', error);
      next(new Error('Internal Server Error'));
    });
};
