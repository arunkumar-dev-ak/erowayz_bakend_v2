import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResponseModule } from 'src/response/response.module';
import { TokenModule } from 'src/token/token.module';
import { FoodPreferenceController } from './food-preference.controller';
import { FoodPreferenceService } from './food-preference.service';

@Module({
  imports: [PrismaModule, ResponseModule, TokenModule],
  controllers: [FoodPreferenceController],
  providers: [FoodPreferenceService],
  exports: [FoodPreferenceService],
})
export class FoodPreferenceModule {}
