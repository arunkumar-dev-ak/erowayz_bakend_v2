import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class GetUnifiedVendorRatingQueryDto {
  @ApiPropertyOptional({ default: 0, description: 'Pagination offset' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ default: 10, description: 'Pagination limit' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    default: true,
    description:
      'Whether to include overall rating summary, star distribution, and parameter averages. Set to false during pagination/scroll.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isOverallSummaryNeeded?: boolean = true;

  @ApiPropertyOptional({
    default: true,
    description:
      "Whether to include the authenticated customer's own rating breakdown. Returns null if guest or not rated.",
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isMyRatingNeeded?: boolean = true;

  @ApiPropertyOptional({
    default: true,
    description:
      "Whether to include the authenticated customer's own written review text. Returns null if guest or not reviewed.",
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isMyReviewNeeded?: boolean = true;

  @ApiPropertyOptional({
    default: true,
    description:
      "Whether to include the authenticated customer's last completed transaction (Order for product vendors, Booking for service/banner vendors).",
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isMyLastTransactionNeeded?: boolean = true;

  @ApiPropertyOptional({
    required: false,
    description: 'Backward-compatible alias for isMyLastTransactionNeeded on Product orders',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isMyLastOrderNeeded?: boolean;

  @ApiPropertyOptional({
    required: false,
    description: 'Backward-compatible alias for isMyLastTransactionNeeded on Service/Banner bookings',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isMyLastBookingNeeded?: boolean;
}
