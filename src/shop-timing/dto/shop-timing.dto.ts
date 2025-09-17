import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DayOfWeek } from '@prisma/client';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'AllDaysOfWeekPresent', async: false })
export class AllDaysOfWeekPresentConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    if (!Array.isArray(value)) return false;

    const providedDays = value.map((entry) => entry.dayOfWeek);
    const uniqueDays = new Set(providedDays);

    const allDays: DayOfWeek[] = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];

    return allDays.every((day) => uniqueDays.has(day));
  }

  defaultMessage(): string {
    return 'All 7 days of the week (MONDAY to SUNDAY) must be provided without duplicates.';
  }
}

export class ShopTimingEntryDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
  })
  @IsEnum(DayOfWeek, {
    message: 'dayOfWeek must be a valid day (e.g., MONDAY, TUESDAY)',
  })
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Time when the shop opens (optional if isClosed is true)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'openTime must be in HH:mm 24-hour format (e.g., 09:00)',
  })
  openTime?: string;

  @ApiProperty({
    description: 'Time when the shop closes (optional if isClosed is true)',
    example: '18:00',
    required: false,
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'closeTime must be in HH:mm 24-hour format (e.g., 18:00)',
  })
  closeTime?: string;

  @ApiProperty({
    description: 'Is the shop closed on this day?',
    example: false,
  })
  @IsBoolean()
  isClosed: boolean;

  @ApiProperty({
    description: 'shop Area',
    example: false,
  })
  @IsString()
  @IsNotEmpty({ message: 'Shop Area is required' })
  area: string;
}

export class ShopTimingDto {
  @ApiProperty({
    type: [ShopTimingEntryDto],
    description: 'Array of 7 entries for each day of the week',
    minItems: 7,
    example: [
      {
        dayOfWeek: 'MONDAY',
        openTime: '2025-06-13 08:27:00.018',
        closeTime: '2025-06-13 08:27:00.018',
        isClosed: false,
        area: 'Cartrabbit',
      },
      {
        dayOfWeek: 'SUNDAY',
        isClosed: true,
      },
    ],
  })
  @Validate(AllDaysOfWeekPresentConstraint)
  @Type(() => ShopTimingEntryDto)
  @ArrayMinSize(7, {
    message: 'You must provide timings for all 7 days of the week',
  })
  timings: ShopTimingEntryDto[];
}
