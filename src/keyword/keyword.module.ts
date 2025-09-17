import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { VendorTypeModule } from 'src/vendor-type/vendor-type.module';

@Module({
  imports: [VendorTypeModule],
  controllers: [KeywordController],
  providers: [KeywordService],
  exports: [KeywordService],
})
export class KeywordModule {}
