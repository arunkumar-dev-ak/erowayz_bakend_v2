import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthGuard, SocketRequest } from 'src/common/guards/auth.guard';
import { RedisService } from 'src/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: true, namespace: 'ordergateway' })
@UseGuards(AuthGuard)
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(OrderGateway.name);

  handleConnection(client: Socket) {
    client.emit('room', client.id + ' joined');
  }

  async handleDisconnect(client: Socket) {
    const socketId = client.id;

    const userId = await this.redisService.get(`order-user:${socketId}`);
    if (!userId) {
      this.logger.warn(
        `No user mapping found for disconnected socket ${socketId}`,
      );
      return;
    }

    await Promise.all([
      this.redisService.srem(`order-sockets:${userId}`, socketId),
      this.redisService.rem(`order-user:${socketId}`),
    ]);

    const remainingSockets = await this.redisService.scard(
      `user-sockets:${userId}`,
    );
    if (remainingSockets === 0) {
      await this.redisService.rem(`user-sockets:${userId}`);
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
        `order-sockets:${userId}`,
        socketId,
        Number(this.configService.get<string>('SOCKET_TTL') || '3600'),
      ),
      this.redisService.set(
        `order-user:${socketId}`,
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
      `order-sockets:${userId}`,
    );
    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
