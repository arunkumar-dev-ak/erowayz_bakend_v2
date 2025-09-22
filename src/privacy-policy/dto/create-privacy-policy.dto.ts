import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreatePrivacyPolicyDto {
  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: UserType,
    required: false,
  })
  @IsEnum(UserType, {
    message: `isDonor must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  userType: UserType;
}
