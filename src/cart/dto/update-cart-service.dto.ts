import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';
import { IsUniqueArrayConstraint } from 'src/vendor/dto/testregistervendor.dto';

export class UpdateCartServiceDto {
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
