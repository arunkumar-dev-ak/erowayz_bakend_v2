import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsString,
  Validate,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class CreateCoinSettlementDto {
  @ApiProperty({
    description: 'cartId',
    required: false,
    example: 'ghfjfkjf547484bnnfmmfgf799',
  })
  @IsNotEmpty()
  @IsString()
  walletTransactionId: string;

  @ApiProperty({
    description: 'bannerId',
    required: false,
    example: 'rehijhnfdjf657585hfhfh',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiProperty({
    type: 'array',
    description: 'KeyWord Ids array must have atleast 1 ids',
    required: true,
  })
  @IsArray({ message: 'KeyWord must be in an array format' })
  @IsNotEmpty({ message: 'uploadedFileIds are required' })
  @IsString({ each: true, message: 'Each uploadedFileIds must be a string' })
  @Validate(IsUniqueArrayConstraint)
  uploadedFileIds: string[];
}
