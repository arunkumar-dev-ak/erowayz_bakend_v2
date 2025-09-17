import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

export class UpdateBankDetailVerifyDto {
  @ApiProperty({
    description: 'isVerified by the admin',
    example: true,
    required: true,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `IsVerified must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  isVerified: TrueOrFalseStatus;
}
