import { ApiProperty } from '@nestjs/swagger';
import { TrueOrFalseStatus } from './edit-user.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UserStatusChangeDto {
  @ApiProperty({
    description: 'userId',
    required: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'UserId is required' })
  userId: string;

  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: TrueOrFalseStatus,
    required: false,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `status must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  status: TrueOrFalseStatus;
}
