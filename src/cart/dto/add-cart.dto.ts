import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class AddCartDto {
  @ApiProperty({
    description: 'ItemId',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'ItemId should be present' })
  itemId: string;

  @ApiProperty({
    description: 'Total quantity',
    required: true,
    example: 1.5,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: ' Total qty must be a valid number with up to 2 decimal places',
    },
  )
  @Min(1.0, { message: ' Total qty must be greater than zero' })
  @IsNotEmpty({ message: 'Total qty should not be empty' })
  totalQty: number;

  @ApiProperty({
    description: 'Array of vendorServiceOptionIds',
    required: true,
    example: ['gfhfkksnsd46378338', 'abchsj772hjsd828'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'vendorServiceOptionIds cannot be empty' })
  @IsString({
    each: true,
    message: 'Each vendorServiceOptionId must be a string',
  })
  @IsNotEmpty({
    each: true,
    message: 'Each vendorServiceOptionId cannot be empty',
  })
  @Validate(IsUniqueArrayConstraint)
  vendorServiceOptionIds: string[];
}
