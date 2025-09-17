import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TrueOrFalseStatus } from 'src/user/dto/edit-user.dto';

export class UpdateShopTimingUtils {
  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: TrueOrFalseStatus,
    required: false,
  })
  @IsEnum(TrueOrFalseStatus, {
    message: `isDonor must be either '${TrueOrFalseStatus.TRUE}' or '${TrueOrFalseStatus.FALSE}'`,
  })
  isClosed: TrueOrFalseStatus;
}
