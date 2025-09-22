import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePrivacyPolicyDto {
  @ApiProperty({
    description: 'Whether the user is a donor',
    enum: UserType,
    required: false,
  })
  @IsEnum(UserType, {
    message: `isDonor must be either '${UserType.CUSTOMER}' or '${UserType.VENDOR}'`,
  })
  @IsOptional()
  userType?: UserType;
}
