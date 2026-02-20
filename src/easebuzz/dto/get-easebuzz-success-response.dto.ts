import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetEaseBuzzSuccessQueryDto {
  @ApiPropertyOptional({ description: 'Transaction Id', type: String })
  @IsString()
  @IsNotEmpty({ message: 'Transaction Id must not empty' })
  txnId!: string;
}
