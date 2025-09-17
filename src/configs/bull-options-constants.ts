import { BullModuleOptions } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const BullModuleOption = {
  useFactory: (configService: ConfigService): BullModuleOptions => ({
    redis: {
      host: configService.get<string>('REDIS_HOST') || 'localhost',
      port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
      password: configService.get<string>('REDIS_PASSWORD') || '',
      db: parseInt(configService.get<string>('REDIS_DATABASE') || '0'),
      username: configService.get<string>('</REDIS_USERNAME>') || 'default',
    },
  }),
  imports: [ConfigModule],
  inject: [ConfigService],
};
