import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDate,
  IsNumber,
  IsArray,
  IsString,
  Validate,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class CreateOrderSettlementDto {
  @ApiProperty({
    description: 'cartId',
    required: false,
    example: 'ghfjfkjf547484bnnfmmfgf799',
  })
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({
    description: 'End date and time of the banner',
    example: '2024-09-30T23:59:59.000Z',
    required: true,
  })
  @IsDate()
  date: Date;

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
