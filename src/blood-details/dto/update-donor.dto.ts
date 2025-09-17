import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

export class UpdateDonorDto {
  @ApiProperty({
    description: 'Status of the dynamic field',
    example: true,
    required: true,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `isDonor must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  isDonor: TrueOrFalseStatus;
}
