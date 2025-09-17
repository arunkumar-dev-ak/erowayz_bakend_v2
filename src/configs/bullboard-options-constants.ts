import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModuleOptions } from '@bull-board/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as basicAuth from 'express-basic-auth';

export const BullBoardOptions = {
  useFactory: (configService: ConfigService): BullBoardModuleOptions => ({
    route: '/queues',
    adapter: ExpressAdapter,
    middleware: basicAuth({
      users: {
        [configService.get<string>('BULL_DASHBOARD_USERNAME') || 'default']:
          configService.get<string>('BULL_DASHBOARD_PASSWORD') || 'default',
      },
      challenge: true,
    }),
  }),
  imports: [ConfigModule],
  inject: [ConfigService],
};
