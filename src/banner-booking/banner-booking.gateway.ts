import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthGuard, SocketRequest } from 'src/common/guards/auth.guard';
import { RedisService } from 'src/redis/redis.service';

@WebSocketGateway({ cors: true, namespace: 'bannnerBookinggateway' })
@UseGuards(AuthGuard)
export class BannerBookingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(BannerBookingGateway.name);

  handleConnection(client: Socket) {
    client.emit('room', client.id + ' joined');
  }

  async handleDisconnect(client: Socket) {
    const socketId = client.id;

    const userId = await this.redisService.get(
      `banner-booking-user:${socketId}`,
    );
    if (!userId) {
      this.logger.warn(
        `No user mapping found for disconnected socket ${socketId}`,
      );
      return;
    }

    await Promise.all([
      this.redisService.srem(`banner-booking-sockets:${userId}`, socketId),
      this.redisService.rem(`banner-booking-user:${socketId}`),
    ]);

    const remainingSockets = await this.redisService.scard(
      `banner-booking-sockets:${userId}`,
    );
    if (remainingSockets === 0) {
      await this.redisService.rem(`banner-booking-sockets:${userId}`);
    }

    this.logger.log(`Socket ${socketId} removed from user ${userId}`);
  }

  @SubscribeMessage('joinRoom')
  async handleSubscribe(@ConnectedSocket() client: SocketRequest) {
    if (!client.user) {
      client.emit('error', 'Unauthorized');
      return;
    }
    const userId = client.user.id;
    const socketId = client.id;

    await Promise.all([
      this.redisService.sadd(
        `banner-booking-sockets:${userId}`,
        socketId,
        Number(this.configService.get<string>('SOCKET_TTL') || '3600'),
      ),
      this.redisService.set(
        `banner-booking-user:${socketId}`,
        userId,
        Number(process.env.SOCKET_TTL || '3600'),
      ),
    ]);

    await client.join(userId);
    this.logger.log(`Client ${socketId} subscribed to user ${userId}`);
  }

  /**
   * Call this from a service to notify a specific user (vendor/customer)
   */
  async notifyUser(userId: string, event: string, payload: any) {
    const socketIds = await this.redisService.smembers(
      `banner-booking-sockets:${userId}`,
    );
    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
