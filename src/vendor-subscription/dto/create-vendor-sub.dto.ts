import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorSubscriptionDto {
  @ApiProperty({
    description: 'UUID of the subscription plan',
    example: 'd5db3b0a-b76a-4f7c-8127-2a5b23907c3a',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'subscriptionPlanId is required' })
  subscriptionPlanId: string;
}
