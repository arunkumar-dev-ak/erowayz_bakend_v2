import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteServiceOption {
  @ApiProperty({ description: 'Id is required', required: true })
  @IsNotEmpty({ message: 'Id is required' })
  @IsString()
  id: string;
}
