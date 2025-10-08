import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsArray,
  Validate,
  IsNumber,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class UpdateOrderSettlementDto {
  @ApiProperty({
    description: 'cartId',
    required: false,
    example: 'ghfjfkjf547484bnnfmmfgf799',
  })
  @IsNotEmpty()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({
    description: 'End date and time of the banner',
    example: '2024-09-30T23:59:59.000Z',
    required: true,
  })
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiProperty({
    description: 'bannerId',
    required: false,
    example: 'rehijhnfdjf657585hfhfh',
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  @IsOptional()
  amount?: number;

  @ApiProperty({
    type: 'array',
    description: 'KeyWord Ids array must have atleast 1 ids',
    required: true,
  })
  @IsArray({ message: 'KeyWord must be in an array format' })
  @IsNotEmpty({ message: 'uploadedFileIds are required' })
  @IsString({ each: true, message: 'Each uploadedFileIds must be a string' })
  @Validate(IsUniqueArrayConstraint)
  @IsOptional()
  uploadedFileIds?: string[];
}
