import { Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Role, Staff, User, Vendor } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { AuthGuard, SocketRequest } from 'src/common/guards/auth.guard';
import { RedisService } from 'src/redis/redis.service';
import {
  StockAlertService,
  StockAlertStackPayload,
  stockAlertSocketsKey,
  stockAlertUserSocketKey,
} from './stock-alert.service';
import { STOCK_ALERT_PUBSUB_CHANNEL } from './utils/stock-alert.utils';

type SocketUserWithVendor = User & {
  vendor?: Vendor | null;
  staff?: Staff | Staff[] | null;
};

@WebSocketGateway({ cors: true, namespace: 'stockalertgateway' })
@UseGuards(AuthGuard)
export class StockAlertGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StockAlertGateway.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly stockAlertService: StockAlertService,
  ) {}

  async onModuleInit() {
    await this.redisService.subscribe(
      STOCK_ALERT_PUBSUB_CHANNEL,
      (message: string) => {
        void this.handlePubSubMessage(message);
      },
    );
    this.logger.log(
      `Subscribed to Redis Pub/Sub channel: ${STOCK_ALERT_PUBSUB_CHANNEL}`,
    );
  }

  handleConnection(client: Socket) {
    client.emit('room', `${client.id} joined`);
  }

  async handleDisconnect(client: Socket) {
    const socketId = client.id;
    const vendorId = await this.redisService.get(
      stockAlertUserSocketKey(socketId),
    );
    if (!vendorId) {
      return;
    }

    await Promise.all([
      this.redisService.srem(stockAlertSocketsKey(vendorId), socketId),
      this.redisService.rem(stockAlertUserSocketKey(socketId)),
    ]);

    const remaining = await this.redisService.scard(
      stockAlertSocketsKey(vendorId),
    );
    if (remaining === 0) {
      await this.redisService.rem(stockAlertSocketsKey(vendorId));
    }

    this.logger.log(
      `StockAlert socket ${socketId} removed for vendor ${vendorId}`,
    );
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: SocketRequest) {
    const user = client.user as SocketUserWithVendor | undefined;
    if (!user) {
      client.emit('error', 'Unauthorized');
      return;
    }

    if (user.role !== Role.VENDOR && user.role !== Role.STAFF) {
      client.emit(
        'error',
        'Only vendors or staff can subscribe to stock alerts',
      );
      return;
    }

    const staffRecord = Array.isArray(user.staff) ? user.staff[0] : user.staff;
    const vendorId = user.vendor?.id ?? staffRecord?.vendorId;
    if (!vendorId) {
      client.emit('error', 'Vendor profile not found');
      return;
    }

    const socketId = client.id;
    const ttl = Number(process.env.SOCKET_TTL || '3600');

    await Promise.all([
      this.redisService.sadd(stockAlertSocketsKey(vendorId), socketId, ttl),
      this.redisService.set(stockAlertUserSocketKey(socketId), vendorId, ttl),
    ]);

    await client.join(vendorId);
    this.logger.log(
      `Socket ${socketId} joined stock alert room for vendor ${vendorId}`,
    );

    const initialStack =
      await this.stockAlertService.getVendorAlertStack(vendorId);
    client.emit('stockAlertStack', initialStack);
  }

  private async handlePubSubMessage(rawMessage: string) {
    try {
      const payload = JSON.parse(rawMessage) as StockAlertStackPayload;
      if (!payload?.vendorId) return;

      const socketIds = await this.redisService.smembers(
        stockAlertSocketsKey(payload.vendorId),
      );
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('stockAlertStack', payload);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Failed to process Redis Pub/Sub stock alert message: ${errorMessage}`,
      );
    }
  }
}
