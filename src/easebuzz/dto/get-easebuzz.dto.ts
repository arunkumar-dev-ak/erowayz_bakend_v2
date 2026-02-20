import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetEaseBuzzPaymentDto {
  @ApiProperty({
    description: 'Get by TxnId',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'TxnId is required' })
  txnId!: string;
}
